import { Tweet } from "@prisma/client";
import prisma from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
}

export const mutations = {
  createTweet: async (
    _: any,
    { payload }: { payload: CreateTweetDataPayload },
    context: GraphqlContext
  ) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const tweet = await prisma.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        user: { connect: { id: context.user.id } },
      },
    });
    return tweet;
  },
};

export const queries = {
  getAllTweets: async (parnt: any, args: any, context: GraphqlContext) => {
    const tweets = (await prisma.tweet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }));
    console.log(tweets);
    return tweets;
  },
  getTweet: async (_: any, { id }: { id: string }, context: GraphqlContext) => {
    return await prisma.tweet.findUnique({
      where: {
        id,
      },
    });
  },
};

export const tweetResolverUser = {
  Tweet: {
    user: async (parent: Tweet) => {
      return await prisma.user.findUnique({
        where: {
          id: parent.userId,
        },
      });
    },
  },
};

export const resolvers = { mutations, queries, tweetResolverUser };
