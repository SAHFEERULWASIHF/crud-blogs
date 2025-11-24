// app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Await the params

    console.log("Fetching user with ID:", id); // Debug log

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Blogs: true,
          },
        },
      },
    });

    console.log("Found user:", user); // Debug log

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// UPDATE user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Await the params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user - include _count in the response
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Blogs: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE user and their blogs
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Await the params

    console.log("Attempting to delete user with ID:", id);

    if (!isValidObjectId(id)) {
      console.log("Invalid ObjectId format:", id);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        Blogs: {
          select: { id: true, title: true },
        },
      },
    });

    console.log("Found user to delete:", existingUser);

    if (!existingUser) {
      console.log("User not found for deletion:", id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      `User has ${existingUser.Blogs.length} blogs that will be deleted`,
    );

    // Use a transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all blogs associated with this user
      const deletedBlogs = await tx.blog.deleteMany({
        where: { authorId: id },
      });

      console.log(`Deleted ${deletedBlogs.count} blogs`);

      // Then delete the user
      const deletedUser = await tx.user.delete({
        where: { id },
      });

      console.log("User deleted successfully");

      return {
        deletedUser,
        deletedBlogsCount: deletedBlogs.count,
      };
    });

    return NextResponse.json({
      success: true,
      message: "User and their blogs deleted successfully",
      deletedBlogsCount: result.deletedBlogsCount,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);

    // More detailed error logging
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Please try again later",
      },
      { status: 500 },
    );
  }
}
