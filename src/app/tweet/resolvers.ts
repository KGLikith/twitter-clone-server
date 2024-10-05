import { Tweet } from "@prisma/client";
import prisma from "../../clients/db";
import { GraphqlContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../services/user";
import TweetServices from "../services/tweet";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
  userId: string;
}

const s3Client = new S3Client({ region: process.env.AWS_DEFAULT_REGION });

export const mutations = {
  createTweet: async (_: any,{ payload }: { payload: CreateTweetDataPayload },context: GraphqlContext) => {
    if (!context.user) {
      throw new Error("Unauthorized");
    }
    return await TweetServices.createTweet({
      ...payload,
      userId: context.user.id,
    });
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
        Bucket: process.env.S3_BUCKET_NAME || "",
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
  },
};

export const resolvers = { mutations, queries, tweetResolverUser };
