import Jwt from "jsonwebtoken";

export default function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT secret");

    Jwt.verify(token, secret);
  } catch (error) {
    const err = error as any;
    console.log({ name: err.name });

    if (err.name === "JsonWebTokenError") {
      throw {
        code: "invalid-token",
        message: "The token you provided is not valid.",
      };
    }
    if (err.name === "TokenExpiredError") {
      throw {
        code: "token-expired",
        message: "The token you provided has expired.",
      };
    }

    throw { message: "Failed to verify token." };
  }
}
