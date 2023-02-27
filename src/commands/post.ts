import { system } from "../system.ts";
import { Command, CommandContext } from "../deps.ts";

// TODO: doesn't work, maybe mulitple instances don't work when listening for DMs ?
/**
 * !post command
 */
export class PostCommand extends Command {
  name = "post";
  dmOnly = true;
  authorizedChatters = [
    "220479351622336512",
    "184562671801204736",
    "183497727248826369",
  ];

  execute(ctx: CommandContext) {
    console.log(ctx);
    if (this.authorizedChatters.includes(ctx.author.id)) {
      system.sendMessage(ctx.message.content.substr(10));
    }
  }
}
