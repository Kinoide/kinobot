import { GetSeenMovies, SessionCodeToString } from "../database.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /history command
 */
export async function SlashHistory(interaction: ApplicationCommandInteraction) {
  const seenMovies = await GetSeenMovies(true, 30);
  let str = ":book: Historique des 30 derniers films visionnés :";
  for (const movie of seenMovies) {
    str += `\n• ${SessionCodeToString(movie.lastSeen)} : **${movie.title}**`;
  }
  await interaction.reply(str);
}
