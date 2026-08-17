import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";

export function createAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: `${process.env.ACCESS_TOKEN_MINUTES}m`, issuer: "clickrush-api", audience: "clickrush-client" }
  );
}

export function createRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
