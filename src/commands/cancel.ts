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

/**
 * /cancel command
 */
export async function SlashCancel(interaction: ApplicationCommandInteraction) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Propositions) {
      interaction.reply("Les propositions ne sont pas ouvertes.");
      return;
    }
    // Check number of arguments
    let movieId = interaction.option<string>("lien");
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
        interaction.reply("Vous n'avez proposé aucun film pour le moment.");
        return;
      }
      // Display select to user
      interaction = await interaction.reply({
        content: `Sélectionner le film à annuler:`,
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
          "Pour annuler le film : `/cancel <lien letterboxd>`",
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
        `${movieId} : Le film n'a pas été proposé.`,
      );
      return;
    }
    const [status, movie] = system.cancelMovieFromID(
      movieId,
      interaction.user.id,
    );
    replyToMovieCancel(interaction, status, movie);
  } catch (error) {
    interaction.reply(
      "Une erreur s'est produite. Veuillez contacter l'administrateur.",
    );
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
      `${interaction.user} a annulé **_${movie?.title}_**.`,
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
        content: `${interaction.user} a annulé **_${movie?.title}_**.`,
        allowedMentions: { users: [] },
      });
      break;
    case CancelStatus.NotFound:
      await interaction.reply({
        content: `${interaction.user} : Le film n'a pas été proposé.`,
        allowedMentions: { users: [] },
        ephemeral: true,
      });
      break;
    case CancelStatus.Forbidden:
      await interaction.reply({
        content:
          `${interaction.user} : Vous n'avez pas les droits de supprimer le film d'un autre`,
        allowedMentions: { users: [] },
        ephemeral: true,
      });
      break;
  }
}
