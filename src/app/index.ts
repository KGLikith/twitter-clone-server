import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { User } from "./user";
import JWTService from "./services/jwt";
import { Tweet } from "./tweet";

export default async function initServer<GraphqlContext>() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const gqlserver = new ApolloServer({
    typeDefs: `
        ${User.types}
        ${Tweet.types}
        type Query {
          ${User.queries}
          ${Tweet.queries}
        }
        type Mutation{
          ${User.mutations}
          ${Tweet.mutations}
        }
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
        ...Tweet.resolvers.mutations,
      },
      ...Tweet.resolvers.tweetResolverUser,
      ...User.resolvers.userResolverTweet,
    },
  });

  await gqlserver.start();

  app.use(
    "/graphql",
    expressMiddleware(gqlserver, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? await JWTService.decodeToken(
                req.headers.authorization.split(" ")[1]
              )
            : undefined,
        };
      },
    })
  );
  return app;
}
