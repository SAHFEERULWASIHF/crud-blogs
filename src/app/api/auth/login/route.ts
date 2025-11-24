import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import generateToken from "../../../helpers/generateToken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    //  Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );

    //  Validate password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );

    // Generate JWT token
    const token = generateToken(user.id);

    //  Set token in secure HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.firstName,
        email: user.email,
      },
      token,
    });

    response.cookies.set("USER_TOKEN", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Login failed. Please try again later." },
      { status: 500 },
    );
  }
}
