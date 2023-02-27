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

/**
 * /openvotes command
 */
export async function SlashOpenVotes(
  interaction: ApplicationCommandInteraction,
) {
  try {
    // Check current phase
    if (system.currentPhase != Phases.Propositions) {
      await interaction.reply("Les propositions ne sont pas ouvertes.");
      return;
    }

    if (system.proposedMovies.size == 0) {
      await interaction.reply("Il n'y a aucun film proposé.");
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
        content: `<@&${
          Deno.env.get("ROLE_ID")
        }> Fermeture des propositions. Les inscrits ont reçu leurs liens par MP. Cliquez sur le bouton pour en avoir un.`,
        components: Array<MessageComponentData>({
          type: MessageComponentType.ACTION_ROW,
          components: new MessageComponents().button({
            label: "Obtenir mon lien de vote",
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
    await interaction.reply(
      "Une erreur s'est produite. Veuillez contacter l'administrateur.",
    );
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
