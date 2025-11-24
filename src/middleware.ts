import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { cookieKeys } from "./config/cookie.config";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  try {
    const session = (await cookies()).get(cookieKeys.USER_TOKEN)?.value;
    const url = request.nextUrl.pathname;
    const secretValue = process.env.JWT_SECRET;

    if (!secretValue) throw new Error("Missing JWT secret");
    const secret = new TextEncoder().encode(secretValue);

    if (session) {
      const payload = (await jwtVerify(session, secret)).payload;
      console.log({ payload });
    }

    const onlyPublicRoutes = ["/register", "/login"];

    if (!session && !onlyPublicRoutes.includes(url)) {
      let nextUrl = "/login";
      nextUrl += `?redirect_to=${url}`;
      return NextResponse.redirect(new URL(nextUrl, request.url));
    }

    if (session && onlyPublicRoutes.includes(url)) {
      const homeUrl = "/";
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    return NextResponse.next();
  } catch {
    (await cookies()).delete(cookieKeys.USER_TOKEN);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:paths*", "/register/:paths*", "/login/:paths*"],
};
