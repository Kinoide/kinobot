import { CancelStatus, Phases, system } from "../system.ts";
import {
  BuildLetterboxd,
  GetTrueUrl,
  IsLetterboxdMovieUrl,
} from "../letterboxd.ts";
import {
  ApplicationCommandInteraction,
  Interaction,
  InteractionMessageComponentData,
  MessageComponentData,
  MessageComponents,
  MessageComponentType,
  SelectComponentOption,
} from "../deps.ts";
import { Movie } from "../movie.ts";
import { getText } from "../languageManager.ts";

/**
 * /cancel command
 */
export async function SlashCancel(interaction: ApplicationCommandInteraction) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Propositions) {
      interaction.reply(getText("cancel.notOpen"));
      return;
    }
    // Check number of arguments
    let movieId = interaction.option<string>(getText("cancel.paramLinkName"));
    // If no link is given, display the select
    if (movieId === undefined) {
      // Build select list
      const select_options: SelectComponentOption[] = [];
      for (const [movie_id, movie] of system.proposedMovies) {
        if (movie.proposedBy.id == interaction.user.id) {
          select_options.push({ label: movie.title, value: movie_id });
        }
      }
      if (select_options.length == 0) {
        interaction.reply(getText("cancel.noProposition"));
        return;
      }
      // Display select to user
      interaction = await interaction.reply({
        content: getText("cancel.movieSelection"),
        ephemeral: true,
        components: Array<MessageComponentData>({
          type: MessageComponentType.ACTION_ROW,
          components: new MessageComponents().select({
            customID: "cancel_movie_select",
            options: select_options,
          }),
        }),
      });
      // Add cancel interaction to the map
      system.cancelInteractions.set(interaction.id, interaction);
      return;
    }

    const url: string = await GetTrueUrl(movieId);
    if (url.startsWith("http://") || url.startsWith("https://")) {
      // If url is not from letterboxd
      if (!IsLetterboxdMovieUrl(url)) {
        interaction.reply(
          getText("cancel.wrongUrl"),
        );
        return;
      }

      // Argument has to be letterboxd link
      const letterboxd = await BuildLetterboxd(url);
      movieId = letterboxd.id;
    }

    // Argument has to be movie ID at this point
    if (!system.proposedMovies.has(movieId)) {
      interaction.reply(
        getText("cancel.movieNotProposed", {user: interaction.user.id, movie: movieId}),
        {
          allowedMentions: { users: [] },
        }
      );
      return;
    }
    const [status, movie] = system.cancelMovieFromID(
      movieId,
      interaction.user.id,
    );
    replyToMovieCancel(interaction, status, movie);
  } catch (error) {
    interaction.reply(getText("cancel.error"));
    console.error(error);
    return;
  }
  return;
}

export function CancelMovieFromButton(interaction: Interaction) {
  const [status, movie] = system.cancelMovieFromLink(
    interaction.message!.embeds[0].url!,
    interaction.user.id,
  );
  replyToMovieCancel(interaction, status, movie);
}

export function CancelMovieFromSelect(
  interaction: Interaction,
  data: InteractionMessageComponentData,
) {
  const [status, movie] = system.cancelMovieFromID(
    data.values![0],
    interaction.user.id,
  );
  if (status == CancelStatus.Cancelled) {
    const originalCancel = system.cancelInteractions.get(
      interaction.message?.interaction?.id!,
    );
    originalCancel?.deleteResponse();
    (movie?.origin as Interaction).send(
      getText("cancel.text", {user: interaction.user.id, movie: movie?.title || ""}),
      {
        allowedMentions: { users: [] },
      },
    );
  }
}

async function replyToMovieCancel(
  interaction: Interaction,
  status: CancelStatus,
  movie: Movie | undefined,
) {
  switch (status) {
    case CancelStatus.Cancelled:
      await interaction.reply({
        content: getText("cancel.text", {user: interaction.user.id, movie: movie?.title || ""}),
        allowedMentions: { users: [] },
      });
      break;
    case CancelStatus.NotFound:
      await interaction.reply({
        content: getText("cancel.movieNotProposed", {user: interaction.user.id, movie: movie?.title || ""}),
        allowedMentions: { users: [] },
        ephemeral: true,
      });
      break;
    case CancelStatus.Forbidden:
      await interaction.reply({
        content:
          getText("cancel.notAuthorized", {user: interaction.user.id}),
        allowedMentions: { users: [] },
        ephemeral: true,
      });
      break;
  }
}
