import axios from "axios";
import prisma from "../../clients/db";
import JWTservice from "../services/jwt"; // Adjust the path as necessary
import { GraphqlContext } from "../../interfaces";
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
const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
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

    console.log(data);
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    console.log(user);

    if (!user) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name,
          profileImageUrl: data.picture,
        },
      });

      const userToken = await JWTservice.generateJWT(user);
      return userToken;
    }
    const userToken = await JWTservice.generateJWT(user);
    // console.log(userToken);
    return userToken;
  },
  getCurrentUser: async (parent: any, args: any, context: GraphqlContext) => {
    const id = context.user?.id;
    if (!id) return null;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  },
  getCurrentUserById: async (
    parent: any,
    { id }: { id: string },
    context: GraphqlContext
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  },
};

const userResolverTweet = {
  User: {
    tweets: async (parent: User) => {
      const tweets = await prisma.tweet.findMany({
        where: {
          userId: parent.id,
        },
      });
      if (!tweets) return [];
      return tweets;
    },
  },
};

export const resolvers = { queries, userResolverTweet };
