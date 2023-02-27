import { Phases, Shuffle, system } from "../system.ts";
import { ApplicationCommandInteraction, Embed, QuickChart } from "../deps.ts";
import { Movie } from "../movie.ts";
import { GetMiskineWinners } from "./miskine.ts";
import { GetSessionCode, ReinitialiseMovieCounter } from "../database.ts";

/**
 * /closevotes command
 */
export async function SlashCloseVotes(
  interaction: ApplicationCommandInteraction,
) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Votes) {
      interaction.reply("Le vote n'est pas ouvert.");
      return;
    }

    // movieIDs is the list of movieIDs ordered by score descending (winner is the at index 0)
    const movieIDs = [...system.proposedMovies.keys()].sort((a, b) =>
      system.proposedMovies.get(b)!.score -
      system.proposedMovies.get(a)!.score
    );

    // finalMovieIDs is the list of movieIDs ordered by score descending, but movies with same scores are shuffled
    const finalMovieIDs: string[] = [];
    let tmp: string[] = [];
    // iterate over each movie ID
    // if its score is the same as the next one, add the current one to the tmp array
    // if its score is different:
    //    - add the current one to the tmp array,
    //    - shuffle the tmp array,
    //    - add the tmp array to the final array,
    //    - clear the tmp array
    for (let i = 0; i < movieIDs.length; i++) {
      if (
        i != movieIDs.length - 1 &&
        system.proposedMovies.get(movieIDs[i])!.score ==
          system.proposedMovies.get(movieIDs[i + 1])!.score
      ) {
        tmp.push(movieIDs[i]);
      } else if (tmp.length > 0) {
        tmp.push(movieIDs[i]);
        Shuffle(tmp);
        finalMovieIDs.push(...tmp);
        tmp = [];
      } else {
        finalMovieIDs.push(movieIDs[i]);
      }
    }

    // This is the winner
    const winner: Movie = system.proposedMovies.get(finalMovieIDs[0])!;

    // Rankings chart to be displayed
    const rankingsChart = new QuickChart();
    const maxTitleSize = 20;
    // make titles short
    const shortTitles = finalMovieIDs.map((movieId) => {
      const title = system.proposedMovies.get(movieId)!.title;
      if (title.length > maxTitleSize) {
        return `${title.substring(0, maxTitleSize - 1)}…`;
      }
      return title;
    });
    const votes = finalMovieIDs.map((obj) =>
      system.proposedMovies.get(obj)!.score
    );
    // set data
    rankingsChart.setConfig({
      type: "bar",
      data: {
        labels: shortTitles,
        datasets: [{
          label: "Votes",
          data: votes,
          backgroundColor: "#AD1457",
        }],
      },
    });
    // create embed and send it
    const resultEmbed = new Embed()
      .setColor("#AD1457")
      .setTitle(`Le grand gagnant est ${winner.title} !`)
      .setDescription(winner.url)
      .setThumbnail(winner.backdrop)
      .setImage(rankingsChart.getUrl());

    await interaction.reply({
      embeds: [resultEmbed],
    });

    const miskine = await GetMiskineWinners();
    interaction.send(miskine);

    ReinitialiseMovieCounter(winner.url, GetSessionCode());

    system.reset();
  } catch (error) {
    interaction.reply(
      "Une erreur s'est produite. Veuillez contacter l'administrateur.",
    );
    console.error(error);
    return;
  }
  return;
}
