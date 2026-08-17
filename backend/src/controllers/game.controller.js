import mongoose from "mongoose";
import Game from "../models/game.model.js";
import { Auth } from "../models/user.model.js";

const VALID_MODES = ["easy", "medium", "hard"];
const MAX_CLICKS = 1500;

export async function submitGame(req, res) {
  const {
    mode,
    accuracy,
    correctClicks,
    incorrectClicks,
    score,
  } = req.body;

  if (
    mode === undefined ||
    accuracy === undefined ||
    correctClicks === undefined ||
    incorrectClicks === undefined ||
    score === undefined
  ) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  const normalizedMode = String(mode).trim().toLowerCase();
  const parsedAccuracy = Number(accuracy);
  const parsedCorrectClicks = Number(correctClicks);
  const parsedIncorrectClicks = Number(incorrectClicks);
  const parsedScore = Number(score);

  if (
    !VALID_MODES.includes(normalizedMode) ||
    !Number.isFinite(parsedAccuracy) ||
    !Number.isInteger(parsedCorrectClicks) ||
    !Number.isInteger(parsedIncorrectClicks) ||
    !Number.isInteger(parsedScore)
  ) {
    return res.status(400).json({
      message: "Invalid game data",
    });
  }

  if (parsedAccuracy < 0 || parsedAccuracy > 100) {
    return res.status(400).json({
      message: "Invalid accuracy value",
    });
  }

  if (
    parsedCorrectClicks < 0 ||
    parsedCorrectClicks > MAX_CLICKS ||
    parsedIncorrectClicks < 0 ||
    parsedIncorrectClicks > MAX_CLICKS
  ) {
    return res.status(400).json({
      message: "Invalid clicks value",
    });
  }

  if (parsedScore < 0) {
    return res.status(400).json({
      message: "Invalid score value",
    });
  }

  try {
    const user = await Auth.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const currentHighScore = user.highScores?.[normalizedMode] ?? 0;
    const newHighScore = parsedScore > currentHighScore;
    const highScore = newHighScore ? parsedScore : currentHighScore;

    const game = await Game.create({
      userId: req.user.id,
      mode: normalizedMode,
      accuracy: parsedAccuracy,
      correctClicks: parsedCorrectClicks,
      incorrectClicks: parsedIncorrectClicks,
      score: parsedScore,
    });

    if (newHighScore) {
      user.highScores[normalizedMode] = parsedScore;
      await user.save();
    }

    req.app.get("io")?.emit("leaderboard:update", {
      gameId: game._id.toString(),
      userId: req.user.id,
      mode: normalizedMode,
      score: parsedScore,
      highScore,
    });

    return res.status(201).json({
      gameId: game._id,
      mode: normalizedMode,
      newHighScore,
      score: parsedScore,
      correct: parsedCorrectClicks,
      incorrect: parsedIncorrectClicks,
      highScore,
      highScores: user.highScores,
      accuracy: parsedAccuracy,
    });
  } catch (error) {
    // console.error("Failed to submit game:", error);

    return res.status(500).json({
      message: "Failed to submit game",
    });
  }
}

export async function history(req, res) {
  try {
    const requestedLimit = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const games = await Game.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      games,
    });
  } catch (error) {
    // console.error("Failed to fetch game history:", error);

    return res.status(500).json({
      message: "Failed to fetch game history",
    });
  }
}

export async function stats(req, res) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [summary, bestByMode] = await Promise.all([
      Game.aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $group: {
            _id: null,
            games: { $sum: 1 },
            totalCorrectClicks: { $sum: "$correctClicks" },
            totalIncorrectClicks: { $sum: "$incorrectClicks" },
            bestScore: { $max: "$score" },
          },
        },
      ]),

      Game.aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $group: {
            _id: "$mode",
            bestScore: { $max: "$score" },
            bestCorrectClicks: { $max: "$correctClicks" },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      summary: summary[0] || {
        games: 0,
        totalCorrectClicks: 0,
        totalIncorrectClicks: 0,
        bestScore: 0,
      },
      bestByMode,
    });
  } catch (error) {
    // console.error("Failed to fetch game stats:", error);

    return res.status(500).json({
      message: "Failed to fetch game stats",
    });
  }
}