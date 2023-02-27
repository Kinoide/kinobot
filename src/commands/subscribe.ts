import { Phases, system } from "../system.ts";
import { Kinophile } from "../kinophile.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /subscribe command
 */
export async function SlashSubscribe(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply("Les propositions ne sont pas ouvertes.");
    return;
  }

  // Add user if he doesn't exist yet. Change its 'subscribed' status if he already is in the list
  if (!system.users.has(interaction.user.id)) {
    system.users.set(
      interaction.user.id,
      new Kinophile(interaction.user, true),
    );
  } else {
    if (system.users.get(interaction.user.id)!.subscribed) {
      await interaction.reply({
        content: "Vous ètes déjà inscrit !",
        ephemeral: true,
      });
      return;
    }
    system.users.get(interaction.user.id)!.subscribed = true;
  }
  interaction.reply({
    content: `${interaction.user} s'est inscrit.`,
    allowedMentions: { users: [] },
  });

  // Send link if vote has already started
  if (system.currentPhase == Phases.Votes) {
    system.users.get(interaction.user.id)!.sendVoteLink();
  }
}
