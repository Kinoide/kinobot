import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /unsubscribe command
 */
export async function SlashUnsubscribe(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply("Les propositions ne sont pas ouvertes.");
    return;
  }

  // Change user 'subscribed' status if he exists
  if (system.users.has(interaction.user.id)) {
    if (!system.users.get(interaction.user.id)!.subscribed) {
      await interaction.reply({
        content: "Vous n'ètes pas encore inscrit !",
        ephemeral: true,
      });
      return;
    }
    system.users.get(interaction.user.id)!.subscribed = false;
  }
  interaction.reply({
    content: `${interaction.user} s'est désinscrit.`,
    allowedMentions: { users: [] },
  });

  // Check if every subscriber has voted
  if (system.subscribers().length == 0) {
    await interaction.send("Il n'y a plus d'inscrits 😥");
    return;
  }
  if (system.currentPhase == Phases.Votes) {
    let allSubscribersHaveVoted = true;
    for (const sub of system.subscribers()) {
      if (!sub.hasVoted) {
        allSubscribersHaveVoted = false;
        break;
      }
    }
    if (allSubscribersHaveVoted) {
      await interaction.send("Tous les inscrits ont voté!");
    }
  }
}
