import axios from "axios";
import prisma from "../../clients/db";
import JWTservice from "../services/jwt"; // Adjust the path as necessary

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

      const userToken = await JWTservice.generateJWT(user);
      return userToken;
    }
    const userToken = await JWTservice.generateJWT(user);
    // console.log(userToken);
    return userToken;
  },
};
export const resolvers = { queries };
