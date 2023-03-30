import { system } from "./system.ts";
import {
  ApplicationCommandInteraction,
  ApplicationCommandPartial,
  Client,
  event,
  Interaction,
  InteractionMessageComponentData,
  InteractionType,
  Message,
  MessageComponentType,
  MessageReaction,
  slash,
  User,
} from "./deps.ts";
import { commands } from "./commands.ts";
import { SlashOpen } from "./commands/open.ts";
import {
  CancelMovieFromButton,
  CancelMovieFromSelect,
  SlashCancel,
} from "./commands/cancel.ts";
import { SlashCloseVotes } from "./commands/closevotes.ts";
import { GetVoteLinkButton, SlashOpenVotes } from "./commands/openvotes.ts";
import { SlashPropose } from "./commands/propose.ts";
import { SlashProposeList } from "./commands/proposelist.ts";
import { SlashQuit } from "./commands/quit.ts";
import { SlashSubscribe } from "./commands/subscribe.ts";
import { SlashSubscribers } from "./commands/subscribers.ts";
import { SlashCountVotes } from "./commands/countvotes.ts";
import { SlashUnsubscribe } from "./commands/unsubscribe.ts";
import { SlashHistory } from "./commands/history.ts";
import { SlashMiskine } from "./commands/miskine.ts";
import { SlashGenres } from "./commands/genres.ts";
import { SlashList } from "./commands/list.ts";
import { SlashVersion } from "./commands/version.ts";
import { getText } from "./languageManager.ts";

export interface ISlashCommand {
  info: ApplicationCommandPartial;
  execute(interaction: ApplicationCommandInteraction): void;
}

export class Kinobot extends Client {
  constructor() {
    super();
  }

  @event()
  async ready() {
    console.log(`Ready! User: ${this.user?.tag}`);
    system.sendMessage(getText("greetings"));

    await this.interactions.commands.bulkEdit(
      commands,
      Deno.env.get("GUILD_ID"),
    );
  }

  @event()
  messageDelete(message: Message): void {
    system.removeMovieFromMessage(message);
  }

  @event()
  messageReactionAdd(reaction: MessageReaction, user: User): void {
    if (reaction.message.channelID == Deno.env.get("CHANNEL_ID")) {
      system.handleReaction(reaction, user);
    }
  }

  @event()
  interactionCreate(interaction: Interaction) {
    switch (interaction.type) {
      // TODO: Handle other interaction types in this switch
      case InteractionType.MESSAGE_COMPONENT: {
        const data = interaction.data as InteractionMessageComponentData;
        switch (data.component_type) {
          // TODO: Handle other message component types in this switch
          case MessageComponentType.BUTTON: {
            switch (data.custom_id) {
              case "cancel_movie":
                CancelMovieFromButton(interaction);
                break;
              case "get_vote_link":
                GetVoteLinkButton(interaction);
                break;
            }
            break;
          }
          case MessageComponentType.SELECT:
            switch (data.custom_id) {
              case "cancel_movie_select":
                CancelMovieFromSelect(interaction, data);
                break;
            }
            break;
          default:
        }
        break;
      }
      default:
    }
  }

  @slash()
  version(interaction: ApplicationCommandInteraction) {
    return SlashVersion(interaction);
  }

  @slash()
  open(interaction: ApplicationCommandInteraction) {
    return SlashOpen(interaction);
  }

  @slash()
  propose(interaction: ApplicationCommandInteraction) {
    return SlashPropose(interaction);
  }

  @slash()
  proposelist(interaction: ApplicationCommandInteraction) {
    return SlashProposeList(interaction);
  }

  @slash()
  list(interaction: ApplicationCommandInteraction) {
    return SlashList(interaction);
  }

  @slash()
  cancel(interaction: ApplicationCommandInteraction) {
    return SlashCancel(interaction);
  }

  @slash()
  subscribe(interaction: ApplicationCommandInteraction) {
    return SlashSubscribe(interaction);
  }

  @slash()
  unsubscribe(interaction: ApplicationCommandInteraction) {
    return SlashUnsubscribe(interaction);
  }

  @slash()
  subscribers(interaction: ApplicationCommandInteraction) {
    return SlashSubscribers(interaction);
  }

  @slash()
  openvotes(interaction: ApplicationCommandInteraction) {
    return SlashOpenVotes(interaction);
  }

  @slash()
  countvotes(interaction: ApplicationCommandInteraction) {
    return SlashCountVotes(interaction);
  }

  @slash()
  closevotes(interaction: ApplicationCommandInteraction) {
    return SlashCloseVotes(interaction);
  }

  @slash()
  quit(interaction: ApplicationCommandInteraction) {
    return SlashQuit(interaction);
  }

  @slash()
  history(interaction: ApplicationCommandInteraction) {
    return SlashHistory(interaction);
  }

  @slash()
  miskine(interaction: ApplicationCommandInteraction) {
    return SlashMiskine(interaction);
  }

  @slash()
  genres(interaction: ApplicationCommandInteraction) {
    return SlashGenres(interaction);
  }
}
