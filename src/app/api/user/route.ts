import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import getPaginationParams from "../../helpers/getPaginationParams";
import handleError from "../../helpers/handleError";
import { UserSchema } from "../../../lib/user.schema";
import generateToken from "../../helpers/generateToken";
import { getUser } from "../../../controller/user.controller";

/**
 * @route POST /api/blog-posts
 * @desc Create a new blog post
 * @access Public
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);

    const hashedPassword = await hash(validatedData.password, 10);

    const isUserExist = await getUser({
      where: { email: validatedData.email },
    });

    if (isUserExist) {
      return NextResponse.json(
        { code: "user-already-exist", message: "User already exists" },
        { status: 400 },
      );
    }

    const newUser = await prisma.user.create({
      data: { ...validatedData, password: hashedPassword },
      omit: {
        password: true,
      },
    });

    const token = generateToken(newUser.id);

    return NextResponse.json({ ...newUser, token }, { status: 201 });
  } catch (error) {
    return handleError(error, "Failed to create user");
  }
}

/**
 * @route GET /api/users
 * @desc Fetch paginated list of users
 * @access Public
 */
export async function GET(request: NextRequest) {
  try {
    const { page, size } = getPaginationParams({
      request,
    });

    const [users, count] = await prisma.$transaction([
      prisma.user.findMany({
        omit: {
          password: true,
        },
        skip: (page - 1) * size,
        take: size,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json(
      {
        items: users,
        count,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleError(error, "Failed to fetch user");
  }
}
