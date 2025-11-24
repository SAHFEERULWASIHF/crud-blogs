// app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import handleError from "../../../helpers/handleError";
import { BlogSchema } from "../../../../lib/blog.schema";
import privateRoute from "../../../helpers/privateRoute";

/**
 * @route PUT /api/blog/[id]
 * @desc Update a blog post
 * @access Private
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return privateRoute(request, async (user) => {
    try {
      const body = await request.json();

      const existingBlog = await prisma.blog.findUnique({
        where: { id },
        include: { Author: true },
      });

      if (!existingBlog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }

      if (existingBlog.authorId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to update this blog post" },
          { status: 403 },
        );
      }

      const validatedData = BlogSchema.partial().parse(body);

      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: { ...validatedData, updatedAt: new Date() },
        include: {
          Author: {
            omit: { password: true, createdAt: true, updatedAt: true },
          },
        },
      });

      return NextResponse.json(updatedBlog, { status: 200 });
    } catch (error) {
      return handleError(error, "Failed to update blog post");
    }
  });
}

/**
 * @route PATCH /api/blog/[id]
 * @desc Partially update a blog post
 * @access Private
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return privateRoute(request, async (user) => {
    try {
      const body = await request.json();

      const existingBlog = await prisma.blog.findUnique({
        where: { id },
        include: { Author: true },
      });

      if (!existingBlog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }

      if (existingBlog.authorId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to update this blog post" },
          { status: 403 },
        );
      }

      const validatedData = BlogSchema.partial().parse(body);

      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: { ...validatedData, updatedAt: new Date() },
        include: {
          Author: {
            omit: { password: true, createdAt: true, updatedAt: true },
          },
        },
      });

      return NextResponse.json(updatedBlog, { status: 200 });
    } catch (error) {
      return handleError(error, "Failed to update blog post");
    }
  });
}

/**
 * @route DELETE /api/blog/[id]
 * @desc Delete a blog post
 * @access Private
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return privateRoute(request, async (user) => {
    try {
      const existingBlog = await prisma.blog.findUnique({
        where: { id },
        include: { Author: true },
      });

      if (!existingBlog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 },
        );
      }

      if (existingBlog.authorId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized to delete this blog post" },
          { status: 403 },
        );
      }

      await prisma.blog.delete({ where: { id } });

      return NextResponse.json(
        { message: "Blog post deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      return handleError(error, "Failed to delete blog post");
    }
  });
}

/**
 * @route GET /api/blog/[id]
 * @desc Fetch a single blog with author details
 * @access Public
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 },
      );
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        Author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    return handleError(error, "Failed to fetch blog post");
  }
}
