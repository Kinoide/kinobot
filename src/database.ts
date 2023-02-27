import { Collection, Database, MongoClient } from "./deps.ts";
import { Movie } from "./movie.ts";

export interface MovieCounters {
  _id: { $oid: string };
  title: string;
  count: number;
  record: number;
  url: string;
  lastSeen: string;
}

let lastCode = "";
let lastSession = 0;
export function GetSessionCode(): string {
  const date = new Date();
  const code = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");
  let session = 1;
  if (lastCode == code) {
    session = lastSession + 1;
  }
  lastCode = code;
  lastSession = session;
  return code + session.toString().padStart(2, "0");
}

export function SessionCodeToString(sessionCode: string) {
  const year = sessionCode.substring(0, 4);
  const month = sessionCode.substring(4, 6);
  const day = sessionCode.substring(6, 8);
  const session = parseInt(sessionCode.substring(8, 10));
  return `${day}/${month}/${year} _(n°${session})_`;
}

/**
 * Connect to the DB
 * @returns
 */
function ConnectDB(): Promise<[MongoClient, Database]> {
  const client = new MongoClient();
  return new Promise((resolve, reject) => {
    /*`mongodb://${env["DB_USER"]}:${env["DB_PASSWORD"]}@${env["DB_URL"]}/`*/
    client.connect(Deno.env.get("MONGODBURL")!).then(() => {
      resolve([client, client.database(Deno.env.get("DB_NAME")!)]);
    }).catch((reason) => {
      reject(reason);
    });
  });
}

/**
 * Get movie_counters collection
 * @param db Database containing the collection
 * @returns the collection
 */
function GetMovieCounters(
  db: Database,
): Collection<MovieCounters> {
  return db.collection<MovieCounters>(Deno.env.get("DB_COLL")!);
}

export function IncrementMovieCounter(movie: Movie) {
  ConnectDB().then(([_, db]) => {
    GetMovieCounters(db).updateOne(
      { url: movie.url },
      { $inc: { count: 1 }, $set: { title: movie.title } },
      { upsert: true },
    );
  });
}

export function ReinitialiseMovieCounter(
  url: string,
  sessionCode: string,
): void {
  ConnectDB().then(([_, db]) => {
    GetMovieCounters(db)
      .findOne({ url: url })
      .then((counter) => {
        if (
          !counter?.record ||
          counter.count > counter.record
        ) {
          GetMovieCounters(db).updateOne(
            { url: url },
            { $set: { record: counter!.count } },
          );
        }
      });
    GetMovieCounters(db).updateOne(
      { url: url },
      { $set: { count: 0, lastSeen: sessionCode } },
    );
  });
}

/**
 * Get seen movies. By default, fetches all seen movies without sorting
 * @param sort Whether to sort by lastSeen or not
 * @param limit Limit the number of results after potentially sorting
 * @returns an array containing seen movies
 */
export function GetSeenMovies(
  sort = false,
  limit?: number,
): Promise<MovieCounters[]> {
  return new Promise((resolve) => {
    ConnectDB().then(([client, db]) => {
      let select = GetMovieCounters(db)
        .find({ record: { $gt: 0 } });
      if (sort) {
        select = select.sort({ lastSeen: -1 });
      }
      if (limit !== undefined) {
        select = select.limit(limit);
      }
      select.toArray().then((movieCounters) => {
        resolve(movieCounters);
        client.close();
      });
    });
  });
}

/**
 * Get the currently miskine movie
 * @returns
 */
export function GetCurrentMiskine(): Promise<MovieCounters> {
  return new Promise((resolve) => {
    ConnectDB().then(([client, db]) => {
      GetMovieCounters(db)
        .find()
        .sort({ count: -1 })
        .limit(1)
        .toArray().then((movieCounters) => {
          resolve(movieCounters[0]);
          client.close();
        });
    });
  });
}

/**
 * Get the movie miskined the most times
 * @returns
 */
export function GetMiskineRecord(): Promise<MovieCounters> {
  return new Promise((resolve) => {
    ConnectDB().then(([client, db]) => {
      GetMovieCounters(db)
        .find()
        .sort({ record: -1 })
        .limit(1)
        .toArray().then((movieCounters) => {
          resolve(movieCounters[0]);
          client.close();
        });
    });
  });
}

/**
 * Get the movie miskined the most times
 * @returns
 */
export function GetAllMiskines(): Promise<MovieCounters[]> {
  return new Promise((resolve) => {
    ConnectDB().then(([client, db]) => {
      GetMovieCounters(db)
        .find({ $or: [{ record: { $exists: false } }, { record: 0 }] })
        .sort({ count: -1 })
        .limit(15)
        .toArray().then((movieCounters) => {
          resolve(movieCounters);
          client.close();
        });
    });
  });
}
