import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /list command
 */
export async function SlashList(interaction: ApplicationCommandInteraction) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply(getText("list.notOpen"));
    return;
  }

  if (system.proposedMovies.size == 0) {
    await interaction.reply(getText("list.noMovieProposed"));
    return;
  }

  // Display proposed movies
  let str = getText("list.header");
  system.proposedMovies.forEach((movie) => {
    str += getText("list.entry", {
      movie: movie.title,
      url: movie.url,
      user: movie.proposedBy.id,
    });
  });
  await interaction.reply({ content: str, allowedMentions: { users: [] } });
}
