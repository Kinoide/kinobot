import { cheerio } from "./deps.ts";
import { CapitalizeWords } from "./utils.ts";

const LETTERBOXD_LONG_URL = "https://letterboxd.com/";
const LETTERBOXD_SHORT_URL = "https://boxd.it/";

/**
 * @param url URL to check
 * @returns true if url is from Letterboxd website
 */
export function IsLetterboxdUrl(url: string): boolean {
  return url.startsWith(LETTERBOXD_LONG_URL);
}

/**
 * @param url URL to check
 * @returns true if url is a movie from Letterboxd website
 */
export function IsLetterboxdMovieUrl(url: string): boolean {
  return url.startsWith(LETTERBOXD_LONG_URL + "film/");
}

/**
 * @param url URL to check
 * @returns true if url is a list from letterboxd website
 */
export function IsLetterboxdListUrl(url: string): boolean {
  return IsLetterboxdUrl(url) &&
    (url.includes("/watchlist/") || url.includes("/list/"));
}

/**
 * @param url to be checked
 * @returns true if it is a Letterboxd short url
 */
export function IsLetterboxdShortUrl(url: string): boolean {
  return url.startsWith(LETTERBOXD_SHORT_URL);
}

/**
 * Returns the long URL of a Letterboxd short URL
 * @param url
 * @returns
 */
export async function GetTrueUrl(url: string): Promise<string> {
  if (IsLetterboxdShortUrl(url)) {
    // Fetch html from url
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    return $("meta[property='og:url']").attr("content")!;
  }
  return url;
}

/**
 * Fetch all movies from letterboxd list
 * @param movieList
 * @param string
 * @param url
 */
export function FetchMoviesFromPage(
  movieList: string[],
  url: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(url).then((response) => {
      if (response.ok) {
        return response.text();
      }
      reject(response);
    }).then((html) => {
      const $ = cheerio.load(html!);
      $("div.poster").each((_, elt) => {
        movieList.push(
          `https://letterboxd.com${$(elt).prop("data-target-link")}`,
        );
      });
      if ($("a.next").length > 0) {
        url = `https://letterboxd.com${$("a.next").prop("href")}`;
        resolve(FetchMoviesFromPage(movieList, url));
      } else {
        resolve();
      }
    }).catch((reason) => {
      reject(reason);
    });
  });
}

export function GetGenres(url: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fetch(url).then((response) => {
      if (response.ok) {
        return response.text();
      }
      reject(response);
    }).then((html) => {
      const $ = cheerio.load(html!);
      resolve(
        $("#tab-genres > div:first-of-type a.text-slug").toArray().map(
          (genre) => {
            return CapitalizeWords($(genre).text());
          },
        ),
      );
    }).catch((reason) => {
      reject(reason);
    });
  });
}

/**
 * Build {@link Letterboxd} object from a Letterboxd URL
 * @param url to letterboxd movie
 * @returns {@link Letterboxd} object
 */
export async function BuildLetterboxd(url: string): Promise<Letterboxd> {
  const letterboxd = new Letterboxd();

  // Fetch html from url
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Parse html and retrieve useful data
  letterboxd.title = $("#featured-film-header>h1").text();
  // trueUrl is useful to retrieve letterboxd id from mobile links
  let trueUrl = $("meta[property='og:url']").attr("content");
  if (trueUrl !== undefined) {
    trueUrl = trueUrl.substring(0, trueUrl.indexOf("/", 28));
    letterboxd.id = trueUrl.substring(28);
    letterboxd.trueUrl = trueUrl + "/";
  }
  letterboxd.image = $("img.image").prop("src") || "";

  // const divPoster = $("div#poster-large > div.poster.film-poster");
  // Look for loadReallyLazyPosters() in https://s.ltrbxd.com/static/js/main.min.d3d84f56.js
  // letterboxd.image = "https://letterboxd.com/ajax/poster" +
  //   divPoster.prop("film-slug") + divPoster.prop("context") + "/" +
  //   divPoster.prop("image-width") + "x" + divPoster.prop("image-height") + "/" +
  //   (divPoster.prop("film-adult") ? "adult/" : "");
  letterboxd.image = JSON.parse(
    $('script[type="application/ld+json"]').text().split("\n")[2],
  )["image"].split("?")[0];
  letterboxd.thumbnail = $("meta[property='og:image']").prop("content");

  return letterboxd;
}

/**
 * Holds a Letterboxd movie info
 */
export class Letterboxd {
  id = "";
  title = "";
  trueUrl = "";
  image = "";
  thumbnail = "";
}
