import { Phases, system } from "../system.ts";
import { Kinophile } from "../kinophile.ts";
import { ApplicationCommandInteraction } from "../deps.ts";
import { getText } from "../languageManager.ts";

/**
 * /subscribe command
 */
export async function SlashSubscribe(
  interaction: ApplicationCommandInteraction,
) {
  // Check current phase
  if (system.currentPhase == Phases.Idle) {
    await interaction.reply(getText("subscribe.notOpen"));
    return;
  }

  // Add user if he doesn't exist yet. Change its 'subscribed' status if he already is in the list
  if (!system.users.has(interaction.user.id)) {
    system.users.set(
      interaction.user.id,
      new Kinophile(interaction.user, true),
    );
  } else {
    if (system.users.get(interaction.user.id)!.subscribed) {
      await interaction.reply({
        content: getText("subscribe.alreadySubscribed"),
        ephemeral: true,
      });
      return;
    }
    system.users.get(interaction.user.id)!.subscribed = true;
  }
  interaction.reply({
    content: getText("subscribe.subscription", {user: interaction.user.id}),
    allowedMentions: { users: [] },
  });

  // Send link if vote has already started
  if (system.currentPhase == Phases.Votes) {
    system.users.get(interaction.user.id)!.sendVoteLink();
  }
}
