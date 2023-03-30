import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /subscribers command
 */
export async function SlashSubscribers(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply(getText("subscribers.notOpen"));
    return;
  }

  // Check user numbers
  if (system.users.size == 0) {
    await interaction.reply(getText("subscribers.nobody"));
    return;
  }

  let str = "";
  // For each subscriber
  for (const user of system.users.values()) {
    if (user.subscribed) {
      // Add vote status
      if (system.currentPhase == Phases.Votes) {
        const status = user.hasVoted
          ? getText("subscribers.statusVoted")
          : getText("subscribers.statusNotVoted");
        str += getText("subscribers.entryVote", {
          user: user.discordUser.username,
          status: status,
        });
      } else {
        str += getText("subscribers.entry", {
          user: user.discordUser.username,
        });
      }
    }
  }

  // Display message depending on if there are some subscribers in the user list
  if (str.length > 0) {
    interaction.reply({
      content: getText("subscribers.header") + str,
      allowedMentions: { users: [] },
    });
  } else {
    await interaction.reply(getText("subscribers.nobody"));
  }
  return;
}
