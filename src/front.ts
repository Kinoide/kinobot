import { Application, renderFileToString, Router } from "./deps.ts";
import { getText } from "./languageManager.ts";
import { logger, Phases, Shuffle, system } from "./system.ts";

export const app = new Application();

/**
 * Try to render the voting page,
 * returning errors if the voting conditions are not met:
 * - Phase is not `Phases.votes`
 * - invalid `voterId` (nonexistent)
 * - user has already voted
 * @param voterId voter Id.
 * @returns
 */
function renderVote(voterId: string): Promise<string> {
  logger.info("rendering votes");
  if (system.currentPhase == Phases.Votes) {
    console.log(voterId);

    // try to find user corresponding to vote id.
    const user = system.getKinophileByVoterId(voterId);

    // if we did not find one, return error message.
    if (user === undefined) {
      return renderFileToString("views/message.ejs", {
        message: getText("front.wrongId"),
      });

      // if the user has already voted, return error message.
    } else if (user.hasVoted) {
      return renderFileToString("views/message.ejs", {
        message: getText("front.alreadyVoted"),
      });
    } else {
      // shuffle titles
      const shuffledIds = [...system.proposedMovies.keys()];
      Shuffle(shuffledIds);

      // console.log(system.proposedMovies);
      shuffledIds.forEach((id) => {
        console.log(system.proposedMovies.get(id)?.title);
        console.log(system.proposedMovies.get(id)?.url);
      });
      
      return renderFileToString("views/vote.ejs", {
        movies: system.proposedMovies,
        shuffledTitles: shuffledIds,
        key: voterId,
        textTitle: getText("front.title"),
        textHeader: getText("front.header"),
        textSubHeader: getText("front.subHeader"),
        textSubmit: getText("front.submit")
      });
    }
    // if the votes are not open, return error message.
  } else {
    return renderFileToString("views/message.ejs", {
      message: getText("front.notOpen"),
    });
  }
}

function handlevote(voterId: string, movies: Array<string>) {
  logger.info(`got movies: ${movies}`);
  if (system.currentPhase == Phases.Votes) {
    const user = system.getKinophileByVoterId(voterId);

    // return early if user not found
    if (user === undefined) {
      return renderFileToString("views/message.ejs", {
        message: getText("front.wrongId"),
      });

      // return early if user has already voted
    } else if (user.hasVoted === true) {
      return renderFileToString("views/message.ejs", {
        message: getText("front.alreadyVoted"),
      });
    } else {
      logger.info(`found user ${user?.discordUser.username}`);
      const nbMovies = system.proposedMovies.size;

      // temporary movie scores
      const scoreTmp = new Map();

      // we reverse the array to have idx~=score
      const moviesRanked = movies.reverse();

      logger.info(`ranked (worst to best): ${moviesRanked}`);
      let success = true;

      // iterate over movies
      for (let i = 0; i < nbMovies; i++) {
        const movieId = moviesRanked[i];
        logger.info(`working on movie ${movieId}`);
        
        // check if movie is in proposed movies
        if (system.proposedMovies.has(movieId)) {
          logger.info(`found movie ${movieId} on proposed movies`);
          // set score
          const score = i + 1;
          scoreTmp.set(movieId, score);

          logger.info(`${movieId} has score ${score}`);
        } else {
          success = false;
          return renderFileToString("views/message.ejs", {
            message: getText("front.invalidEntry", {movie: moviesRanked[i]}),
          });
        }
      }

      // if everything went well, update global scores
      if (success) {
        logger.info(`system movies : ${system.proposedMovies}`);
        scoreTmp.forEach((score, movieId) => {
          logger.info(
            `attempting to get movie key ${movieId}, adding ${score}`,
          );
          const movieFromSystem = system.proposedMovies.get(movieId);
          if (movieFromSystem) {
            movieFromSystem.score += score;
          } else {
            return renderFileToString("views/message.ejs", {
              message: getText("front.invalidEntry", {movie: movieId}),
            });
          }
        });

        logger.info(`updated movie scores: ${system.proposedMovies}`);

        if (user) {
          user.hasVoted = true;
          user.subscribed = true;

          // update vote count
          system.votesCount++;

          if (system.votesCount == system.subscribers().length) {
            system.sendMessage(getText("front.everybodyHasVoted"));
          }
        } else {
          return renderFileToString("views/message.ejs", {
            message: getText("front.invalidVoter", {user: voterId}),
          });
        }

        return renderFileToString("views/message.ejs", {
          message: getText("front.validated"),
        });
      }
    }
  } else {
    return renderFileToString("views/message.ejs", {
      message: getText("front.notOpen"),
    });
  }
}

const router = new Router();
router
  .get("/vote/:key", async (context) => {
    if (context.params.key != undefined) {
      context.response.body = await renderVote(context.params.key);
    }
  })
  .post("/submit/:key", async (context) => {
    if (typeof context.params.key === "string") {
      const body = context.request.body();
      const movies = await (body.value);
      const movieArray = [];
      for (const [_, value] of movies.entries()) {
        logger.info(`pushing movie ${value} into movieArray`);
        movieArray.push(value);
      }
      context.response.body = await handlevote(context.params.key, movieArray);
    } else {
      // return error page
      context.response.body = await renderFileToString(
        "views/message.ejs",
        {
          message: getText("front.noKey"),
        },
      );
    }
  });

app.use(router.routes());
app.use(router.allowedMethods());
