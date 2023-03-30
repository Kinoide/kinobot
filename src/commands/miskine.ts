import { ApplicationCommandInteraction, Embed, QuickChart } from "../deps.ts";
import {
  GetAllMiskines,
  GetCurrentMiskine,
  GetMiskineRecord,
} from "../database.ts";
import { getText } from "../languageManager.ts";

/**
 * /miskine command
 */
export async function SlashMiskine(interaction: ApplicationCommandInteraction) {
  await interaction.defer();

  // Display miskine winners
  const winners = await GetMiskineWinners();

  const miskines = await GetAllMiskines();

  // Rankings chart to be displayed
  const miskineChart = new QuickChart();
  const maxTitleSize = 20;
  // make titles short
  const shortTitles = miskines.map((obj) => {
    if (obj.title.length > maxTitleSize) {
      return `${obj.title.substr(0, maxTitleSize - 1)}…`;
    }
    return obj.title;
  });
  const counts = miskines.map((obj) => obj.count);
  // set data
  miskineChart.setConfig({
    type: "bar",
    data: {
      labels: shortTitles,
      datasets: [{
        label: getText("miskine.votesLabel"),
        data: counts,
        backgroundColor: "#5714AD",
      }],
    },
  });
  // create embed and send it
  const miskineEmbed = new Embed()
    .setColor("#5714AD")
    .setTitle(getText("miskine.title"))
    .setImage(miskineChart.getUrl());
  await interaction.reply({
    content: winners,
    embeds: [miskineEmbed],
  });
}

/**
 * Display miskine winners (current & previous record)
 */
export async function GetMiskineWinners(): Promise<string> {
  const currentMiskine = await GetCurrentMiskine();
  const recordMiskine = await GetMiskineRecord();
  return getText("miskine.currentMiskine", {movie: currentMiskine.title, number: String(currentMiskine.count)}) + "\n" +
    getText("miskine.recordMiskine", {movie: recordMiskine.title, number: String(recordMiskine.record)});
}
