import { ApplicationCommandInteraction } from "../deps.ts";

const ghRepo = "Kinoide/kinobot";
const urlRegex = new RegExp(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
);

/**
 * /version command
 */
export async function SlashVersion(interaction: ApplicationCommandInteraction) {
  const version = Deno.env.get("VERSION") || "dev";

  let htmlURL = "", releaseNote = "";
  // Get release note of current version
  let ghRelease = await fetchRelease(version);
  switch (ghRelease.status) {
    case 200:
      {
        // If found, get data
        const rel = await ghRelease.json();
        htmlURL = rel["html_url"];
        releaseNote = rel["body"];
      }
      break;
    case 404:
      {
        // If not found, get data from latest release
        ghRelease = await fetchRelease();
        if (ghRelease.status == 200) {
          const rel = await ghRelease.json();
          htmlURL = rel["html_url"];
          releaseNote = rel["body"];
        }
      }
      break;
    default:
      break;
  }

  releaseNote = releaseNote.replaceAll(urlRegex, "<$&>");
  const changes = `${releaseNote}\n\n_Voir les détails: <${htmlURL}>_`;

  await interaction.reply({
    content: `**Version ${version}**\n\n${changes}`,
    ephemeral: true,
  });
}

/**
 * Fetches the release info from github api
 * @param version Specific tag version to the release. If undefined, uses the latest release
 * @returns
 */
function fetchRelease(version?: string): Promise<Response> {
  let url = `https://api.github.com/repos/${ghRepo}/releases/latest`;
  if (version) {
    url = `https://api.github.com/repos/${ghRepo}/releases/tags/v${version}`;
  }

  return fetch(
    url,
    {
      method: "GET",
      headers: {
        "Accept": "Accept: application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
}
