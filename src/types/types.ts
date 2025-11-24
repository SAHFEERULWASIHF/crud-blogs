import { z } from "zod";

import { User } from "@prisma/client";
import { LoginSchema, UserSchema } from "@/lib/user.schema";
import { BlogSchema } from "@/lib/blog.schema";

export type UserInput = z.infer<typeof UserSchema>;

export type UserResponse = User & { token: string };

export type BlogInput = z.infer<typeof BlogSchema>;

export type GetBlogParam = { page?: number; size?: number; search?: string };

export type LoginInput = z.infer<typeof LoginSchema>;
