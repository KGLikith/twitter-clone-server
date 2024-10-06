import { GraphqlContext } from "../../interfaces";
import { User } from "@prisma/client";
import UserService from "../services/user";
import TweetServices from "../services/tweet";
import prisma from "../../clients/db";
import e from "express";
import redisClient from "../../clients/redis/db";

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    return await UserService.verifyGoogleUserAuthToken(token);
  },

  getCurrentUser: async (_: any, args: any, context: GraphqlContext) => {
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

const mutations = {
  followUser: async (
    _: any,
    { to }: { to: string },
    context: GraphqlContext
  ) => {
    if (!context.user || !context.user.id) throw new Error("Unauthorized");
    await UserService.followUser(context.user.id!, to);
    await redisClient.del(`RECOMMENDEDUSERS:${context.user.id}`);
    return true;
  },

  unfollowUser: async (
    _: any,
    { to }: { to: string },
    context: GraphqlContext
  ) => {
    if (!context.user || !context.user.id) throw new Error("Unauthorized");
    await UserService.unfollowUser(context.user.id!, to);
    await redisClient.del(`RECOMMENDEDUSERS:${context.user.id}`);
    return true;
  },
};

const userResolverTweet = {
  User: {
    tweets: async (parent: User) => {
      return await TweetServices.getUserTweets(parent.id);
    },

    followers: async (parent: User) => {
      const cachedFollowers = await redisClient.get(`FOLLOWERS:${parent.id}`);
      if (cachedFollowers) return JSON.parse(cachedFollowers);

      const followers = await prisma.follows.findMany({
        where: { following: { id: parent.id } },
        include: { follower: true },
      });
      const Followers = followers.map((f) => f.follower);

      await redisClient.set(
        `FOLLOWERS:${parent.id}`,
        JSON.stringify(Followers),'EX',3600
      );
      return Followers;
    },

    following: async (parent: User) => {
      const cachedFollowing = await redisClient.get(`FOLLOWING:${parent.id}`);
      if (cachedFollowing) return JSON.parse(cachedFollowing);

      const following = await prisma.follows.findMany({
        where: { follower: { id: parent.id } },
        select: { following: true },
      });

      const Following = following.map((f) => f.following);
      await redisClient.set(
        `FOLLOWING:${parent.id}`,
        JSON.stringify(Following),'EX',3600
      );
      return Following;
    },

    recommendedUsers: async (parent: User, _: any, context: GraphqlContext) => {
      if (!context.user || !context.user.id) return [];

      return await UserService.reccomendUsers(context.user as User);
    },
  },
};

export const resolvers = { queries, userResolverTweet, mutations };
