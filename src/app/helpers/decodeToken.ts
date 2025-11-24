import jwt, { JwtPayload } from "jsonwebtoken";

export default function decodeToken<T>(token: string) {
  try {
    const decodedToken = jwt.decode(token);
    return decodedToken as JwtPayload & T;
  } catch {
    throw {
      code: "token-decode-failed",
      message: "Decoding token failed.",
    };
  }
}
