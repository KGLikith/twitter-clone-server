import axios from "axios";
import prisma from "../../clients/db";
import JWTService from "./jwt";
import redisClient from "../../clients/redis/db";
import { User } from "@prisma/client";

interface GoogleTokenInfo {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  nbf: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: string;
  exp: string;
  jti: string;
  alg: string;
  kid: string;
  typ: string;
}

class UserService {
  public static async verifyGoogleUserAuthToken(token: string) {
    const googleToken = token;
    const googleOauthUrl = new URL(
      "https://www.googleapis.com/oauth2/v3/tokeninfo"
    );
    googleOauthUrl.searchParams.set("id_token", googleToken);

    const { data } = await axios.get<GoogleTokenInfo>(
      googleOauthUrl.toString(),
      {
        responseType: "json",
      }
    );

    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });

      const userToken = await JWTService.generateJWT(user);
      return userToken;
    }
    const userToken = await JWTService.generateJWT(user);
    // console.log(userToken);
    return userToken;
  }

  public static async getUserById(id: string) {
    const cachedUser = await redisClient.get(`USER:${id}`);
    // console.log("cache",cachedUser)
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    // console.log("user",user)
    await redisClient.set(`USER:${id}`, JSON.stringify(user));

    return user;
  }

  public static async followUser(from: string, to: string) {
    const following = await prisma.follows.create({
      data: {
        follower: { connect: { id: from } },
        following: { connect: { id: to } },
      },
      include: { following: true, follower: true },
    });
    redisClient.del(`FOLLOWERS:${to}`);
    redisClient.del(`FOLLOWING:${from}`);

    return following;
  }

  public static async unfollowUser(from: string, to: string) {
    redisClient.del(`FOLLOWERS:${to}`);
    redisClient.del(`FOLLOWING:${from}`);
    return await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: from,
          followingId: to,
        },
      },
    });
  }

  public static async reccomendUsers(user: User) {
    const cachedRecommendedUsers = await redisClient.get(
      `RECOMMENDEDUSERS:${user.id}`
    );
    // console.log("cache", cachedRecommendedUsers);
    if (cachedRecommendedUsers) return JSON.parse(cachedRecommendedUsers);

    const myFollowing = await prisma.follows.findMany({
      where: {
        follower: { id: user.id },
      },
      include: {
        following: {
          include: { followers: { select: { following: true } } },
        },
      },
    });
    // console.log("myFollowing", myFollowing);

    const recommendedUsers = [] as User[];
    myFollowing.forEach((following) => {
      following.following.followers.forEach((element) => {
        if (
          myFollowing.findIndex(
            (el) =>
              el.following.id === element.following.id ||
              user?.id === element.following.id
          ) < 0
        ) {
          if (
            recommendedUsers.findIndex((el) => el.id === element.following.id) <
            0
          )
            recommendedUsers.push(element.following);
        }
      });
    });
    const cachedFollowers = await redisClient.get(`FOLLOWERS:${user.id}`);
    let followers;
    if (cachedFollowers) {
      followers = JSON.parse(cachedFollowers);
    } else {
      followers = await prisma.follows.findMany({
        where: {
          following: { id: user.id },
        },
        include: { follower: true },
      });
    }
    followers.forEach((el: any) => {
      if (
        recommendedUsers.findIndex(
          (elem) => elem?.id === el?.follower?.id || elem.id === el?.id
        ) < 0 &&
        myFollowing.findIndex(
          (elem) =>
            elem?.following.id === el.follower?.id ||
            elem?.following.id === el?.id
        ) < 0
      ) {
        recommendedUsers.push(el.follower || el);
      }
    });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const newUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo, 
        },
        id: {
          not: user.id, 
          notIn: myFollowing.map((f) => f.following.id), 
        },
      },
    });

    newUsers.forEach((newUser) => {
      if (recommendedUsers.findIndex((u) => u.id === newUser.id) < 0) {
        recommendedUsers.push(newUser);
      }
    });
    
    await redisClient.set(
      `RECOMMENDEDUSERS:${user.id}`,
      JSON.stringify(recommendedUsers),
      "EX",
      3600
    );
    // console.log("rec", recommendedUsers);
    return recommendedUsers;
  }
}

export default UserService;
