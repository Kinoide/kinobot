import {
  ApplicationCommandOptionType,
  ApplicationCommandPartial,
} from "./deps.ts";
import { getText } from "./languageManager.ts";

export const commands: ApplicationCommandPartial[] = [
  {
    name: "version",
    description: getText("version.desc"),
  },
  {
    name: "open",
    description: getText("open.desc"),
    options: [
      {
        name: getText("open.paramNumberName"),
        description: getText("open.paramNumberDesc"),
        required: false,
        type: ApplicationCommandOptionType.NUMBER,
      },
    ],
  },
  {
    name: "propose",
    description: getText("propose.desc"),
    options: [
      {
        name: getText("propose.paramLinkName"),
        description: getText("propose.paramLinkDesc"),
        required: true,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "proposelist",
    description: getText("proposelist.desc"),
    options: [
      {
        name: getText("proposelist.paramLinkName"),
        description: getText("proposelist.paramLinkDesc"),
        required: true,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "cancel",
    description: getText("cancel.desc"),
    options: [
      {
        name: getText("cancel.paramLinkName"),
        description: getText("cancel.paramLinkDesc"),
        required: false,
        type: ApplicationCommandOptionType.STRING,
      },
    ],
  },
  {
    name: "list",
    description: getText("list.desc"),
  },
  {
    name: "subscribe",
    description: getText("subscribe.desc"),
  },
  {
    name: "unsubscribe",
    description: getText("unsubscribe.desc"),
  },
  {
    name: "subscribers",
    description: getText("subscribers.desc"),
  },
  {
    name: "openvotes",
    description: getText("openvotes.desc"),
  },
  {
    name: "countvotes",
    description: getText("countvotes.desc"),
  },
  {
    name: "closevotes",
    description: getText("closevotes.desc"),
  },
  {
    name: "quit",
    description: getText("quit.desc"),
  },
  {
    name: "history",
    description: getText("history.desc"),
  },
  {
    name: "miskine",
    description: getText("miskine.desc"),
  },
  {
    name: "genres",
    description: getText("genres.desc"),
  },
];
