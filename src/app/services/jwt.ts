import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../../interfaces";

export default class JWTService {
  public static async generateJWT(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
    };

    const token = JWT.sign(payload, process.env.JWT_SECRET as string);
    return token;
  }

  public static async decodeToken(token: string) {
    try {
      const decoded = JWT.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JWTUser;
      return decoded;
    } catch (e) {
      return null;
    }
  }
}
