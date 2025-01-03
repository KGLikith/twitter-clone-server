import prisma from "../../clients/db";
import redisClient from "../../clients/redis/db";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
  userId: string;
}

class TweetServices {
  public static async createTweet(payload: CreateTweetDataPayload) {
    const ratelimitFlag = await redisClient.get(
      `RateLimit:tweet:${payload.userId}`
    );
    if (ratelimitFlag)
      throw new Error("Please wait before creating another tweet");

    const tweet = await prisma.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        user: { connect: { id: payload.userId } },
      },
    });
    redisClient.setex(`RateLimit:tweet:${payload.userId}`, 5, 1);
    redisClient.del("ALL_TWEETS");
    redisClient.del(`TWEET:${payload.userId}`);

    return tweet;
  }

  public static async getAllTweets() {
    const chachedTweets = await redisClient.get("ALL_TWEETS");
    if (chachedTweets) {
      return JSON.parse(chachedTweets);
    }
    const tweets = await prisma.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
      },
    });
    redisClient.set("ALL_TWEETS", JSON.stringify(tweets), "EX", 360);
    return tweets;
  }

  public static async getTweetById(id: string) {
    const tweet = await prisma.tweet.findUnique({
      where: {
        id,
      },
      include: {
        comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
      },
    });
    return tweet;
  }

  public static async getUserTweets(userId: string) {
    const cachedUserTweets = await redisClient.get(`TWEET:${userId}`);
    if (cachedUserTweets) return JSON.parse(cachedUserTweets);
    const tweets = await prisma.tweet.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        comments: {orderBy:{createdAt:"desc"}},
      },
    });

    redisClient.set(`TWEET:${userId}`, JSON.stringify(tweets), "EX", 60);
    if (!tweets) return [];
    return tweets;
  }
}

export default TweetServices;
