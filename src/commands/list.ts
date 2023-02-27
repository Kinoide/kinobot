import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /list command
 */
export async function SlashList(interaction: ApplicationCommandInteraction) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply("Les propositions ne sont pas ouvertes.");
    return;
  }

  if (system.proposedMovies.size == 0) {
    await interaction.reply("Il n'y a aucun film proposé.");
    return;
  }

  // Display proposed movies
  let str = "**Films proposés :**";
  system.proposedMovies.forEach((movie) => {
    str +=
      `\n• **_${movie.title}_** (<${movie.url}>) proposé par ${movie.proposedBy}`;
  });
  await interaction.reply({ content: str, allowedMentions: { users: [] } });
}
