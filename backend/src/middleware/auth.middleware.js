import jwt from "jsonwebtoken";
import "dotenv/config";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const token = authorization.slice(7);

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "clickrush-api",
      audience: "clickrush-client",
    });

    if (payload.type !== "access") {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
}