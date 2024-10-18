import prisma from "../../clients/db";
import redisClient from "../../clients/redis/db";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
  userId: string;
}

class TweetServices {
  public static async createTweet(payload: CreateTweetDataPayload) {
    const ratelimitFlag = await redisClient.get(`RateLimit:tweet:${payload.userId}`);
    if(ratelimitFlag) throw new Error("Please wait before creating another tweet");

    const tweet = await prisma.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        user: { connect: { id: payload.userId } },
      },
    });
    await redisClient.setex(`RateLimit:tweet:${payload.userId}`, 10, 1);
    await redisClient.del("ALL_TWEETS");
    await redisClient.del(`TWEET:${payload.userId}`);

    return tweet;
  }

  public static async getAllTweets() {
    const chachedTweets = await redisClient.get("ALL_TWEETS");
    if(chachedTweets) return JSON.parse(chachedTweets);
    const tweets = await prisma.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include:{
        comments: true
      }
    });
    await redisClient.set("ALL_TWEETS", JSON.stringify(tweets),'EX',60);
    return tweets;
  }

  public static async getTweetById(id: string) {
    const tweet = await prisma.tweet.findUnique({
      where: {
        id,
      },
      include:{
        comments: true
      }
    });
    return tweet;
  }

  public static async getUserTweets(userId: string) {
    const cachedUserTweets = await redisClient.get(`TWEET:${userId}`);
    if(cachedUserTweets) return JSON.parse(cachedUserTweets);
    const tweets = await prisma.tweet.findMany({
      where: {
        userId,
      },
      orderBy:{
        createdAt: "desc"
      }
    });
    
    await redisClient.set(`TWEET:${userId}`, JSON.stringify(tweets),'EX',60);
    if(!tweets) return [];
    return tweets;
  }
}

export default TweetServices;
