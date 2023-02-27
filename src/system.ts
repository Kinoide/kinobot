import { log } from "./deps.ts";
import { Kinobot } from "./kinobot.ts";
import { Kinophile } from "./kinophile.ts";
import { Movie } from "./movie.ts";

import {
  AllMessageOptions,
  Interaction,
  Message,
  MessageReaction,
  User,
} from "./deps.ts";

// Get variables from .env file
export const logger = log.getLogger();

/**
 * All voting phases possible
 */
export enum Phases {
  Idle, // Nothing to do
  Propositions, // Users can propose movies
  Votes, // Users can vote for movies
}

/**
 * Shuffle an array in-place
 * @param array Array to shuffle
 */
export function Shuffle(array: unknown[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Represend the cancellation status of a movie
 */
export enum CancelStatus {
  Cancelled, // Film was cancelled
  NotFound, // Film doesn't exist
  Forbidden, // Film wasn't proposed by the right person
}

/**
 * This class holds everything necessary for the voting system
 */
export class System {
  client: Kinobot = new Kinobot();
  textChannelId: string = Deno.env.get("CHANNEL_ID")!;

  currentPhase: Phases = Phases.Idle;
  maxPropositions = 2;
  users: Map<string, Kinophile> = new Map();
  proposedMovies: Map<string, Movie> = new Map();
  cancelInteractions: Map<string, Interaction> = new Map();
  votesCount = 0;

  listenReactions = -1;

  /**
   * Send a message to the text channel (either text message or embed message)
   */
  sendMessage(
    content?: string | AllMessageOptions,
    option?: AllMessageOptions,
  ): Promise<Message> {
    return this.client.channels.sendMessage(
      this.textChannelId,
      content,
      option,
    );
  }

  handleReaction(reaction: MessageReaction, user: User) {
    this.proposedMovies.forEach((movie) => {
      if (movie.origin.id == reaction.message.id) {
        this.removeMovie(movie, user.id);
      }
    });
  }

  /**
   * Cancels a movie, if it's the same user who proposed it.
   * @param movie Movie to remove
   * @param userId User trying to remove the movie
   * @returns True if it was the same user, false it it wasn't
   */
  cancelMovieFromID(
    movieID: string,
    userID: string,
  ): [CancelStatus, Movie | undefined] {
    const movie = this.proposedMovies.get(movieID);
    if (movie == undefined) {
      return [CancelStatus.NotFound, undefined];
    }
    if (movie.proposedBy.id != userID) {
      return [CancelStatus.Forbidden, movie];
    }
    this.proposedMovies.delete(movie!.id);
    this.unsubscribeUserIfNoMovieFromThem(movie!.proposedBy.id);
    return [CancelStatus.Cancelled, movie];
  }

  /**
   * Cancels a movie, if it's the same user who proposed it.
   * @param movie Movie to remove
   * @param userId User trying to remove the movie
   * @returns True if it was the same user, false it it wasn't
   */
  cancelMovieFromLink(
    movieLink: string,
    userID: string,
  ): [CancelStatus, Movie | undefined] {
    for (const [_movieID, movie] of this.proposedMovies) {
      if (movie.url == movieLink) {
        if (movie.proposedBy.id != userID) {
          return [CancelStatus.Forbidden, movie];
        }
        this.proposedMovies.delete(movie!.id);
        this.unsubscribeUserIfNoMovieFromThem(movie!.proposedBy.id);
        return [CancelStatus.Cancelled, movie];
      }
    }
    return [CancelStatus.NotFound, undefined];
  }

  /**
   * Remove a movie from the list, if it's the same user who proposed it.
   * @param movie Movie to remove
   * @param userId User trying to remove the movie
   * @returns True if it was the same user, false it it wasn't
   */
  removeMovie(movie: Movie, userId: string): boolean {
    if (movie.proposedBy.id != userId) {
      return false;
    }
    this.sendMessage(
      `${movie.proposedBy} a supprimé ${movie.title}.`,
    );
    this.proposedMovies.delete(movie.id);
    this.unsubscribeUserIfNoMovieFromThem(movie.proposedBy.id);
    return true;
  }

  /**
   * Remove a movie from the list using the original message.
   * @param message Message corresponding to the movie proposition that will be removed
   * @returns True if it was the same user, false it it wasn't
   */
  removeMovieFromMessage(message: Message): void {
    this.proposedMovies.forEach((movie) => {
      if (movie.origin.id == message.id) {
        this.sendMessage(
          `${movie.proposedBy} a supprimé ${movie.title}.`,
        );
        this.proposedMovies.delete(movie.id);
        this.unsubscribeUserIfNoMovieFromThem(movie.proposedBy.id);
        return;
      }
    });
  }

  /**
   * Remove user if he has no movie proposed
   * @param userId ID of the user to check
   * @returns True if the user was unsubscribed
   */
  unsubscribeUserIfNoMovieFromThem(userId: string): boolean {
    for (const [_, movie] of this.proposedMovies) {
      if (movie.proposedBy.id == userId) {
        // If the user has a proposed movie, return and do nothing
        return false;
      }
    }
    if (this.users.has(userId)) {
      const kinophile = this.users.get(userId);
      kinophile!.subscribed = false;
      this.sendMessage(
        {
          content: `${kinophile!.discordUser} a été désinscrit !`,
          allowedMentions: { users: [] },
        },
      );
    }
    return true;
  }

  /**
   * @returns an array of {@link Kinophile}s who subscribed
   */
  subscribers(): Kinophile[] {
    const kinos: Kinophile[] = [];
    this.users.forEach((user) => {
      if (user.subscribed) {
        kinos.push(user);
      }
    });
    return kinos;
  }

  /**
   * Get a {@link Kinophile} by its voterId, if it exists.
   * @param voterId Voter id of the requested user
   * @returns {@link Kinophile} or {@link undefined}, depending on existence.
   */
  getKinophileByVoterId(voterId: string): Kinophile | undefined {
    for (const [_, user] of this.users) {
      if (user.voterId == voterId) {
        return user;
      }
    }
  }

  /**
   * Returns a list of URLs of proposed movies
   * @returns
   */
  getProposedMoviesAsURLList(): string[] {
    return Array.from(system.proposedMovies.values()).map<string>((movie) =>
      movie.url
    );
  }

  /**
   * Reset the voting system (currentPhase, users, etc.)
   */
  reset(): void {
    this.currentPhase = Phases.Idle;
    this.maxPropositions = 2;
    this.users = new Map();
    this.proposedMovies = new Map();
    this.cancelInteractions = new Map();
    this.votesCount = 0;
  }
}

export const system = new System();
