import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /countvotes command
 */
export async function SlashCountVotes(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase != Phases.Votes) {
    interaction.reply("Le vote n'est pas ouvert.");
    return;
  }

  await interaction.reply(
    `Il y a actuellement ${system.votesCount}/${system.subscribers().length} votes.`,
  );
}
