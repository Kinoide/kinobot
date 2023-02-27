import { Interaction, Message, User } from "./deps.ts";

/**
 * Movie holds all info needed about a specific movie
 */
export class Movie {
  id: string; // Letterboxd ID (https://letterboxd.com/film/<id>/)
  title: string; // Title of the movie
  url: string; // Letterboxd URL
  origin: Message | Interaction; // Discord message or interaction where the movie was proposed
  proposedBy: User; // Discord user who proposed the movie
  image: string; // Poster URL
  backdrop: string; // Backdrop URL
  score = 0; // Score during vote

  constructor(
    id: string,
    title: string,
    url: string,
    origin: Message | Interaction,
    proposedBy: User,
    image: string,
    backdrop: string,
  ) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.origin = origin;
    this.proposedBy = proposedBy;
    this.image = image;
    this.backdrop = backdrop;
  }
}
