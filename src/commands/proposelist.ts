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
import { getText } from "../languageManager.ts";

/**
 * /proposelist command
 */
export async function SlashProposeList(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase != Phases.Propositions) {
    interaction.reply(getText("proposelist.notOpen"));
    return;
  }

  const url: string = await GetTrueUrl(
    interaction.option<string>(getText("proposelist.paramLinkName")),
  );
  // If url is not a list
  if (!IsLetterboxdListUrl(url)) {
    interaction.reply(getText("proposelist.incorrectLink"));
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
    interaction.reply(getText("proposelist.limit"));
    return;
  }

  // Get a random movie
  let movieList: string[] = [];
  await FetchMoviesFromPage(movieList, url);
  const proposedURLs = system.getProposedMoviesAsURLList();
  movieList = movieList.filter((movie) => !proposedURLs.includes(movie));
  if (movieList.length == 0) {
    interaction.reply(getText("proposelist.allAlreadyProposed"));
    return;
  }
  const picked = movieList[Math.floor(Math.random() * movieList.length)];

  // Get movie info from letterboxd
  const letterboxd = await BuildLetterboxd(picked);
  if (letterboxd.id != "") {
    if (system.proposedMovies.has(letterboxd.id)) {
      interaction.reply(getText("proposelist.alreadyProposed"));
      return;
    }

    await interaction.reply(
      {
        content: getText("proposelist.proposition", {
          user: interaction.user.id,
          url: url,
          movie: picked,
        }),
        components: Array<MessageComponentData>({
          type: MessageComponentType.ACTION_ROW,
          components: new MessageComponents().button({
            label: getText("proposelist.cancel"),
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
