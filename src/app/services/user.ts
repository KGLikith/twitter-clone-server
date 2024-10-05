import axios from "axios";
import prisma from "../../clients/db";
import JWTService from "./jwt";

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

      const userToken = await JWTService.generateJWT(user);
      return userToken;
    }
    const userToken = await JWTService.generateJWT(user);
    // console.log(userToken);
    return userToken;
  }

  public static async getUserById(id: string) {

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }
}

export default UserService;
