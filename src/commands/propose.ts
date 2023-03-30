import { Phases, system } from "../system.ts";
import {
  BuildLetterboxd,
  GetTrueUrl,
  IsLetterboxdMovieUrl,
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
 * /propose command
 */
export async function SlashPropose(interaction: ApplicationCommandInteraction) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Propositions) {
      interaction.reply({
        content: getText("propose.notOpen"),
        ephemeral: true,
      });
      return;
    }

    const url: string = await GetTrueUrl(
      interaction.option<string>(getText("propose.paramLinkName")),
    );
    // If url is not a movie
    if (!IsLetterboxdMovieUrl(url)) {
      interaction.reply({
        content: getText("propose.incorrectLink"),
        ephemeral: true,
      });
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
      interaction.reply({
        content: getText("propose.limit"),
        ephemeral: true,
      });
      return;
    }

    // Get movie info from letterboxd
    const letterboxd = await BuildLetterboxd(url);
    if (letterboxd.id != "") {
      if (system.proposedMovies.has(letterboxd.id)) {
        interaction.reply({
          content: getText("propose.alreadyProposed"),
          ephemeral: true,
        });
        return;
      }

      await interaction.reply(
        {
          content: getText("propose.proposition", {
            user: interaction.user.id,
            movie: url,
          }),
          components: Array<MessageComponentData>({
            type: MessageComponentType.ACTION_ROW,
            components: new MessageComponents().button({
              label: getText("propose.cancel"),
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
  } catch (error) {
    interaction.reply(getText("propose.error"));
    console.error(error);
  }
}
