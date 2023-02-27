import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { GetGenres } from "./letterboxd.ts";

Deno.test("GetGenres", async () => {
  const genres = await GetGenres("https://letterboxd.com/film/the-batman");
  assertEquals(genres, ["Mystery", "Thriller", "Crime"]);
});
