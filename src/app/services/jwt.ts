import { User } from "@prisma/client";
import JWT from "jsonwebtoken";

export default class JWTService{
    public static async generateJWT(user: User) {
        const payload={
            id: user?.id,
            email: user?.email,
        }

        const token= JWT.sign(payload, process.env.JWT_SECRET as string);
        return token;
    }
}