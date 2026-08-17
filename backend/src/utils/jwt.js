import jwt from "jsonwebtoken";
import "dotenv/config";

export function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
