import { Phases, system } from "../system.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /open command
 */
export function SlashOpen(interaction: ApplicationCommandInteraction) {
  // Check current phase
  if (system.currentPhase != Phases.Idle) {
    interaction.reply(getText("open.sessionNotFinished"));
    return;
  }

  interaction;
  let maxProp = interaction.option<number>(getText("open.paramNumberName"));
  if (maxProp === undefined || maxProp < 0) {
    maxProp = 2;
  }
  system.maxPropositions = maxProp;

  // Change phase
  system.currentPhase = Phases.Propositions;

  // Display message depending on maxPropositions
  if (system.maxPropositions == 0) {
    interaction.reply(
      getText("open.unlimited", { role: Deno.env.get("ROLE_ID")! }),
    );
  } else {
    interaction.reply(
      getText("open.limited", {
        role: Deno.env.get("ROLE_ID")!,
        maxPropositions: String(system.maxPropositions),
      }),
    );
  }
}
