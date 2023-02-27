import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /subscribers command
 */
export async function SlashSubscribers(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply("Les propositions ne sont pas ouvertes.");
    return;
  }

  // Check user numbers
  if (system.users.size == 0) {
    await interaction.reply("Personne n'est inscrit");
    return;
  }

  let str = "";
  // For each subscriber
  for (const user of system.users.values()) {
    if (user.subscribed) {
      // Add vote status
      if (system.currentPhase == Phases.Votes) {
        str += `\n• ${user.discordUser} : ${
          user.hasVoted ? "A voté" : "En attente du vote"
        }`;
      } else {
        str += `\n• ${user.discordUser}`;
      }
    }
  }

  // Display message depending on if there are some subscribers in the user list
  if (str.length > 0) {
    interaction.reply({
      content: "**Inscrits :**" + str,
      allowedMentions: { users: [] },
    });
  } else {
    await interaction.reply("Personne n'est inscrit 😥");
  }
  return;
}
