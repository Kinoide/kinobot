import {
  ApplicationCommandInteraction,
  ButtonStyle,
  Interaction,
  MessageAttachment,
  MessageComponentData,
  MessageComponents,
  MessageComponentType,
} from "../deps.ts";

/**
 * /version command
 */
export async function SlashVersion(interaction: ApplicationCommandInteraction) {
  const version = Deno.env.get("VERSION") || "dev";

  const decoder = new TextDecoder("utf-8");
  const data = await Deno.readFile("./patch_notes.json");
  const patchNotes = JSON.parse(decoder.decode(data));

  const latestNotes = patchNotes[version];
  let changes = `:\n`;

  if (latestNotes != undefined) {
    if ((latestNotes["majorChanges"] as Array<string>).length != 0) {
      changes += `\n**Changements majeurs**:\n`;
      for (const majorChange of latestNotes["majorChanges"]) {
        changes += `- ${majorChange}\n`;
      }
    }
    if ((latestNotes["minorChanges"] as Array<string>).length != 0) {
      changes += `\n**Changements mineurs**:\n`;
      for (const minorChange of latestNotes["minorChanges"]) {
        changes += `- ${minorChange}\n`;
      }
    }
  }

  await interaction.reply({
    content: `**Version ${version}**${changes}`,
    ephemeral: true,
    components: Array<MessageComponentData>({
      type: MessageComponentType.ACTION_ROW,
      components: new MessageComponents().button({
        label: "Télécharger les notes de mise à jour",
        customID: "get_patch_notes",
        style: ButtonStyle.PRIMARY,
      }),
    }),
  });
}

export async function GetPatchNotes(interaction: Interaction) {
  interaction.reply({
    files: [
      await MessageAttachment.load("./patch_notes.json"),
    ],
    ephemeral: true,
  });
}
