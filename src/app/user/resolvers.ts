import prisma from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserService from "../services/user";
import TweetServices from "../services/tweet";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    return await UserService.verifyGoogleUserAuthToken(token);
  },
  getCurrentUser: async (parent: any, args: any, context: GraphqlContext) => {
    const id = context.user?.id;
    if (!id) return null;
    return await UserService.getUserById(id);
  },

  getUserById: async (
    parent: any,
    { id }: { id: string },
    context: GraphqlContext
  ) => {
    return await UserService.getUserById(id);
  },
};

const userResolverTweet = {
  User: {
    tweets: async (parent: User) => {
      return await TweetServices.getUserTweets(parent.id)
    },
  },
};

export const resolvers = { queries, userResolverTweet };
