import { Phases, system } from "../system.ts";
import {
  ApplicationCommandInteraction,
  ButtonStyle,
  Interaction,
  MessageComponentData,
  MessageComponents,
  MessageComponentType,
} from "../deps.ts";
import { IncrementMovieCounter } from "../database.ts";
import { Kinophile } from "../kinophile.ts";
import { getText } from "../languageManager.ts";

/**
 * /openvotes command
 */
export async function SlashOpenVotes(
  interaction: ApplicationCommandInteraction,
) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Propositions) {
      await interaction.reply(getText("openvotes.notOpen"));
      return;
    }

    if (system.proposedMovies.size == 0) {
      await interaction.reply(getText("openvotes.noMovieProposed"));
      return;
    }

    system.currentPhase = Phases.Votes;

    // Send message to subscribers
    system.users.forEach((user) => {
      if (user.subscribed) {
        user.sendVoteLink();
      }
    });
    await interaction.reply(
      {
        content: getText("openvotes.text", { role: Deno.env.get("ROLE_ID")! }),
        components: Array<MessageComponentData>({
          type: MessageComponentType.ACTION_ROW,
          components: new MessageComponents().button({
            label: getText("openvotes.button"),
            customID: "get_vote_link",
            style: ButtonStyle.PRIMARY,
          }),
        }),
      },
    );

    for (const movie of system.proposedMovies.values()) {
      IncrementMovieCounter(movie);
    }
  } catch (error) {
    await interaction.reply(getText("openvotes.error"));
    console.error(error);
    return;
  }
}

export function GetVoteLinkButton(interaction: Interaction) {
  const kinophile = system.users.get(interaction.user.id) ||
    new Kinophile(interaction.user, true);
  kinophile.subscribed = true;
  system.users.set(interaction.user.id, kinophile);
  interaction.reply({
    content: kinophile.getVoteLink(),
    ephemeral: true,
  });
}
