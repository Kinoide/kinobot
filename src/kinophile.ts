import { system } from "./system.ts";
import { User } from "./deps.ts";

/**
 * Kinophile is a discord member proposing a movie
 */
export class Kinophile {
  discordUser: User; // Discord user
  subscribed = false; // If user is subscribed or not
  voterId: string; // Voter ID (used for voting link)
  hasVoted = false; // If user has voted or not

  constructor(user: User, subscribed: boolean = false) {
    this.discordUser = user;
    this.subscribed = subscribed;
    this.voterId = crypto.randomUUID();
  }

  /**
   * @returns The number of movie propositions this kinophile has made
   */
  getNbOfPropositions(): number {
    let count = 0;
    system.proposedMovies.forEach((movie) => {
      if (movie.proposedBy.id == this.discordUser.id) {
        count++;
      }
    });
    return count;
  }

  /**
   * Send vote link to the kinophile via private message
   */
  sendVoteLink(): void {
    this.discordUser.send(this.getVoteLink());
  }

  /**
   * Returns the vote link for this kinophile
   * @returns
   */
  getVoteLink(): string {
    return `http://${Deno.env.get("EXT_URL")}:${
      Deno.env.get("EXT_PORT")
    }/vote/${this.voterId}`;
  }
}
