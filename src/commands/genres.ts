import { GetGenres, IsLetterboxdMovieUrl } from "../letterboxd.ts";
import { ApplicationCommandInteraction, Embed, QuickChart } from "../deps.ts";
import { GetSeenMovies } from "../database.ts";

/**
 * !genres command
 */
export async function SlashGenres(interaction: ApplicationCommandInteraction) {
  const allGenres: Map<string, number> = new Map();

  const seenMovies = await GetSeenMovies();
  const nbSeenMovies = seenMovies.length;

  await interaction.defer();

  // For each movie
  for (let count = 0; count < nbSeenMovies; count++) {
    const movie = seenMovies[count];
    if (IsLetterboxdMovieUrl(movie.url)) {
      // Get its genres
      // If the genre is already in the map, add 1 to its count
      // Else, add it to the map
      for (const movieGenre of await GetGenres(movie.url)) {
        if (allGenres.has(movieGenre)) {
          allGenres.set(movieGenre, allGenres.get(movieGenre)! + 1);
        } else {
          allGenres.set(movieGenre, 1);
        }
      }
    }
  }

  // Sort the genres
  const sortedGenres = new Map(
    [...allGenres.entries()].sort((a, b) => b[1] - a[1]),
  );
  // Get the sum of the genres
  const genresSum = [...sortedGenres.values()].reduce((prev, val) =>
    prev + val
  );
  // Create the chart
  const genresChart = new QuickChart();
  genresChart.setConfig({
    type: "pie",
    data: {
      labels: [...sortedGenres.keys()], // genre names
      datasets: [{ // genre %
        data: [...sortedGenres.values()].map((val) => {
          return Math.round(100 * val / genresSum);
        }),
      }],
    },
  });
  // Create embed
  const genresEmbed = new Embed()
    .setColor("#57AD14")
    .setTitle("Genres des films visionnés (en %) :")
    .setImage(genresChart.getUrl());

  await interaction.reply({
    embeds: [genresEmbed],
  });
}
