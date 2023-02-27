import "https://deno.land/std@0.178.0/dotenv/load.ts";
import { app } from "./front.ts";
import { system } from "./system.ts";
import { GatewayIntents } from "./deps.ts";

// launch discord bot
await system.client.connect(Deno.env.get("BOT_TOKEN")!, [
  GatewayIntents.DIRECT_MESSAGES,
  GatewayIntents.GUILDS,
  GatewayIntents.GUILD_MESSAGES,
  GatewayIntents.GUILD_MESSAGE_REACTIONS,
]);

// launch front
await app.listen({ port: Number(Deno.env.get("PORT")) });
