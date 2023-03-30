import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /countvotes command
 */
export async function SlashCountVotes(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase != Phases.Votes) {
    interaction.reply(getText("countvotes.notOpen"));
    return;
  }

  await interaction.reply(
    getText("countvotes.text", {
      number: String(system.votesCount),
      total: String(system.subscribers().length),
    }),
  );
}
