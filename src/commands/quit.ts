import { system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /quit command
 */
export async function SlashQuit(interaction: ApplicationCommandInteraction) {
  system.reset();
  await interaction.reply("La session est annulée.");
}
