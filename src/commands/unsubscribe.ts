import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /unsubscribe command
 */
export async function SlashUnsubscribe(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply(getText("unsubscribe.notOpen"));
    return;
  }

  // Change user 'subscribed' status if he exists
  if (system.users.has(interaction.user.id)) {
    if (!system.users.get(interaction.user.id)!.subscribed) {
      await interaction.reply({
        content: getText("unsubscribe.notSubscribed"),
        ephemeral: true,
      });
      return;
    }
    system.users.get(interaction.user.id)!.subscribed = false;
  }
  interaction.reply({
    content: getText("unsubscribe.unsubscription", {
      user: interaction.user.id,
    }),
    allowedMentions: { users: [] },
  });

  // Check if every subscriber has voted
  if (system.subscribers().length == 0) {
    await interaction.send(getText("unsubscribe.noMoreSubscribers"));
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
      await interaction.send(getText("unsubscribe.everybodyHasVoted"));
    }
  }
}
