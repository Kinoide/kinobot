import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";

/**
 * /open command
 */
export function SlashOpen(interaction: ApplicationCommandInteraction) {
  // Check current phase
  if (system.currentPhase != Phases.Idle) {
    interaction.reply("Le vote précédent n'est pas clos.");
    return;
  }

  interaction;
  let maxProp = interaction.option<number>("nombre");
  if (maxProp === undefined || maxProp < 0) {
    maxProp = 2;
  }
  system.maxPropositions = maxProp;

  // Change phase
  system.currentPhase = Phases.Propositions;

  // Display message depending on maxPropositions
  if (system.maxPropositions == 0) {
    interaction.reply(
      `<@&${
        Deno.env.get("ROLE_ID")
      }> Film ce soir comme d'hab. Faites vos propositions avec !propose lien_letterboxd. Vous pouvez proposer autant de films que vous le souhaitez.`,
    );
  } else {
    interaction.reply(
      `<@&${
        Deno.env.get("ROLE_ID")
      }> Film ce soir comme d'hab. Faites vos propositions avec !propose lien_letterboxd. Vous pouvez proposer ${system.maxPropositions} film·s.`,
    );
  }
}
