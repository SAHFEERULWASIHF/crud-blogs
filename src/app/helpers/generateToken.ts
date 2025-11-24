import jwt from "jsonwebtoken";

export default function generateToken(id: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT secret");

    const token = jwt.sign({ id }, secret, { expiresIn: "1d" });

    return token;
  } catch {
    throw {
      code: "error-generating-jwt",
      message: "Failed to generate token",
    };
  }
}
