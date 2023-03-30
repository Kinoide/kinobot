import { GetSeenMovies, SessionCodeToString } from "../database.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /history command
 */
export async function SlashHistory(interaction: ApplicationCommandInteraction) {
  const seenMovies = await GetSeenMovies(true, 30);
  let str = getText("history.header");
  for (const movie of seenMovies) {
    str += getText("history.entry", {date: SessionCodeToString(movie.lastSeen), movie: movie.title});
  }
  await interaction.reply(str);
}
