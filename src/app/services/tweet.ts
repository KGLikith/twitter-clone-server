import prisma from "../../clients/db";

interface CreateTweetDataPayload {
  content: string;
  imageUrl?: string;
  userId: string;
}

class TweetServices {
  public static async createTweet(payload: CreateTweetDataPayload) {
    const tweet = await prisma.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        user: { connect: { id: payload.userId } },
      },
    });
    return tweet;
  }

  public static async getAllTweets() {
    const tweets = await prisma.tweet.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(tweets);
    return tweets;
  }

  public static async getTweetById(id: string) {
    const tweet = await prisma.tweet.findUnique({
      where: {
        id,
      },
    });
    return tweet;
  }

  public static async getUserTweets(userId: string) {
    const tweets = await prisma.tweet.findMany({
      where: {
        userId,
      },
      orderBy:{
        createdAt: "desc"
      }
    });
    if(!tweets) return [];
    return tweets;
  }
}

export default TweetServices;
