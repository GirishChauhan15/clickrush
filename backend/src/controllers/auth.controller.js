import bcrypt from "bcryptjs";
import { Auth } from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import {
  clearRefreshCookie,
  REFRESH_COOKIE,
  setRefreshCookie,
} from "../utils/cookies.js";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
} from "../utils/tokens.js";

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 7;

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    nationality: user.nationality,
    highScores: user.highScores,
  };
}

async function issueSession(user, res) {
  const refreshToken = createRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });

  setRefreshCookie(res, refreshToken);

  return createAccessToken(user);
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedName || normalizedName.length < 2 || normalizedName.length > 30) {
    return res.status(400).json({
      message: "Name must be between 2 and 30 characters long.",
    });
  }

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Enter a valid email address.",
    });
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  const existingUser = await Auth.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Email is already registered.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await Auth.create({
    name: normalizedName,
    email: normalizedEmail,
    password: passwordHash,
  });

  const token = await issueSession(user, res);

  return res.status(201).json({
    token,
    user: publicUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Invalid user credential.",
    });
  }

  if (!password || !PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message: "Invalid user credential.",
    });
  }

  const user = await Auth.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const token = await issueSession(user, res);

  return res.json({
    token,
    user: publicUser(user),
  });
}

export async function refresh(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];

  if (!rawToken) {
    return res.status(401).json({
      message: "Refresh session not found.",
    });
  }

  const storedToken = await RefreshToken.findOneAndUpdate(
    {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      new: false,
    }
  );

  if (!storedToken) {
    clearRefreshCookie(res);

    return res.status(401).json({
      message: "Refresh session expired.",
    });
  }

  const user = await Auth.findById(storedToken.userId);

  if (!user) {
    clearRefreshCookie(res);

    return res.status(401).json({
      message: "User not found.",
    });
  }

  const token = await issueSession(user, res);

  return res.json({
    token,
    user: publicUser(user),
  });
}

export async function logout(req, res) {
  const rawToken = req.cookies?.[REFRESH_COOKIE];

  if (rawToken) {
    await RefreshToken.updateOne(
      {
        tokenHash: hashToken(rawToken),
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      }
    );
  }

  clearRefreshCookie(res);

  return res.status(200).json({
    message: "Logged out successfully.",
  });
}

export async function logoutAll(req, res) {
  await RefreshToken.updateMany(
    {
      userId: req.user.id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );

  clearRefreshCookie(res);

  return res.status(200).json({
    message: "Logged out from all devices successfully.",
  });
}

export async function me(req, res) {
  const user = await Auth.findById(req.user.id).lean();

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  return res.json({
    user: publicUser(user),
  });
}

export async function updateUserNationality(req, res) {
  const nationality = req.body?.nationality?.trim();

  if (!nationality) {
    return res.status(400).json({
      message: "Nationality is required.",
    });
  }

  const user = await Auth.findByIdAndUpdate(
    req.user.id,
    { nationality },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  return res.status(200).json({
    user: publicUser(user),
    message: "Nationality updated successfully.",
  });
}