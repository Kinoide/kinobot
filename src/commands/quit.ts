import { system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /quit command
 */
export async function SlashQuit(interaction: ApplicationCommandInteraction) {
  system.reset();
  await interaction.reply(getText("quit.text"));
}
