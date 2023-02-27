import { Phases, system } from "../system.ts";
import {
  BuildLetterboxd,
  FetchMoviesFromPage,
  GetTrueUrl,
  IsLetterboxdListUrl,
} from "../letterboxd.ts";
import { Kinophile } from "../kinophile.ts";
import { Movie } from "../movie.ts";
import {
  ApplicationCommandInteraction,
  ButtonStyle,
  MessageComponentData,
  MessageComponents,
  MessageComponentType,
} from "../deps.ts";

/**
 * /proposelist command
 */
export async function SlashProposeList(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase != Phases.Propositions) {
    interaction.reply("Les propositions ne sont pas ouvertes.");
    return;
  }

  const url: string = await GetTrueUrl(interaction.option<string>("lien"));
  // If url is not a list
  if (!IsLetterboxdListUrl(url)) {
    interaction.reply("Lien incorrect");
    return;
  }

  // Get kinophile from current list or create them
  let kinophile = system.users.get(interaction.user.id);
  if (kinophile === undefined) {
    kinophile = new Kinophile(interaction.user);
    system.users.set(interaction.user.id, kinophile);
  }

  if (
    system.maxPropositions != 0 &&
    kinophile.getNbOfPropositions() >= system.maxPropositions
  ) {
    interaction.reply("Vous avez suffisament proposé ! :angry:");
    return;
  }

  // Get a random movie
  let movieList: string[] = [];
  await FetchMoviesFromPage(movieList, url);
  const proposedURLs = system.getProposedMoviesAsURLList();
  movieList = movieList.filter((movie) => !proposedURLs.includes(movie));
  if (movieList.length == 0) {
    interaction.reply("Tous les films de la liste sont déjà proposés.");
    return;
  }
  const picked = movieList[Math.floor(Math.random() * movieList.length)];

  // Get movie info from letterboxd
  const letterboxd = await BuildLetterboxd(picked);
  if (letterboxd.id != "") {
    if (system.proposedMovies.has(letterboxd.id)) {
      interaction.reply("Le film a déjà été proposé.");
      return;
    }

    await interaction.reply(
      {
        content:
          `${interaction.user} propose un film aléatoire de la liste <${url}>.\nLe film est: ${picked}.`,
        components: Array<MessageComponentData>({
          type: MessageComponentType.ACTION_ROW,
          components: new MessageComponents().button({
            label: "Annuler",
            customID: "cancel_movie",
            style: ButtonStyle.DESTRUCTIVE,
          }),
        }),
        allowedMentions: {
          users: [],
        },
      },
    );

    // Add movie to proposed movies
    system.proposedMovies.set(
      letterboxd.id,
      new Movie(
        letterboxd.id,
        letterboxd.title,
        letterboxd.trueUrl,
        interaction,
        interaction.user,
        letterboxd.image,
        letterboxd.thumbnail,
      ),
    );

    // Subscribe user
    kinophile.subscribed = true;
  }
}
