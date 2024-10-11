import { Tweet } from "@prisma/client";
import prisma from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../services/user";
import TweetServices from "../services/tweet";
import redisClient from "../../clients/redis/db";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
}

const s3Client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });

export const mutations = {
  createTweet: async (
    _: any,
    { payload }: { payload: CreateTweetDataPayload },
    context: GraphqlContext
  ) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    return await TweetServices.createTweet({
      ...payload,
      userId: context.user.id,
    });
  },

  LikeTweet: async (
    _: any,
    { tweetId }: { tweetId: string },
    context: GraphqlContext
  ) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const liked = await prisma.tweet.update({
      where: {
        id: tweetId,
      },
      data: {
        likes: {
          push: context.user.id,
        },
      },
    });
    await redisClient.del("ALL_TWEETS");
    await redisClient.del(`TWEET:${context.user.id}`);
    if (!liked) return false;
    return true;
  },

  UnlikeTweet: async (
    _: any,
    { tweetId }: { tweetId: string },
    context: GraphqlContext
  ) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId },
      select: { likes: true },
    });

    const updatedLikes = tweet?.likes.filter(
      (likeId) => likeId !== context.user?.id
    );

    const unliked = await prisma.tweet.update({
      where: {
        id: tweetId,
      },
      data: {
        likes: {
          set: updatedLikes,
        },
      },
    });
    await redisClient.del("ALL_TWEETS");
    await redisClient.del(`TWEET:${context.user.id}`);
    if (!unliked) return false;
    return true;
  },
};

export const queries = {
  getAllTweets: async (parnt: any, args: any, context: GraphqlContext) => {
    return await TweetServices.getAllTweets();
  },

  getTweet: async (_: any, { id }: { id: string }, context: GraphqlContext) => {
    return await TweetServices.getTweetById(id);
  },

  getSignedURLForTweet: async (
    _: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    context: GraphqlContext
  ) => {
    if (!context.user || !context.user.id) {
      throw new Error("Unauthorized");
    }
    const allowedImageTypes = [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/webp",
    ];
    if (!allowedImageTypes.includes(imageType)) {
      throw new Error("Invalid Image Type");
    } else {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME as string,
        ContentType: imageType,
        Key: `uploads/${
          context.user.id
        }/tweets/${imageName}-${Date.now().toString()}.${imageType}`,
      });

      const signedUrl = await getSignedUrl(s3Client, putObjectCommand);
      return signedUrl;
    }
  },
};

export const tweetResolverUser = {
  Tweet: {
    user: async (parent: Tweet) => {
      return await UserService.getUserById(parent.userId);
    },
    likes: async (parent: Tweet) => {
      const like = await prisma.tweet.findUnique({
        where: {
          id: parent.id,
        },
        select: {
          likes: true,
        },
      });
      if (!like) return [];
      return like.likes;
    },
  },
};

export const resolvers = { mutations, queries, tweetResolverUser };
