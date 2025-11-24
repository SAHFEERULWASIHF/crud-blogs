import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function privateRoute(
  _: NextRequest,
  cb: (user: { id: string }, token: string) => Promise<NextResponse>,
) {
  try {
    const authorization = (await headers()).get("Authorization");
    const token = authorization?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { code: "user-not-authorized", message: "You are not authorized" },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { code: "server-error", message: "Missing JWT secret" },
        { status: 500 },
      );
    }

    jwt.verify(token, secret);
    const decodedToken = jwt.decode(token) as JwtPayload & { id: string };

    return cb(decodedToken, token);
  } catch (error) {
    const err = error as any;

    if (err.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          code: "invalid-token",
          message: "The token you provided is not valid.",
        },
        { status: 401 },
      );
    }

    if (err.name === "TokenExpiredError") {
      return NextResponse.json(
        {
          code: "token-expired",
          message: "The token you provided has expired.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { code: "unknown-error", message: "Unexpected error occurred." },
      { status: 500 },
    );
  }
}
