import { assertArrayIncludes } from "https://deno.land/std@0.219.1/testing/asserts.ts";
import { GetGenres } from "./letterboxd.ts";

Deno.test("GetGenres", async () => {
  const genres = await GetGenres("https://letterboxd.com/film/the-batman");
  assertArrayIncludes(genres, ["Mystery", "Thriller", "Crime"]);
});
