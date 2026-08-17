import Game from "../models/game.model.js";
import mongoose from "mongoose";

const GAME_MODES = ["easy", "medium", "hard"];
const PERIODS = ["global", "daily", "weekly"];

const MINIMUM_SCORE = {
  global: 0,
  daily: 5000,
  weekly: 10000,
};

function dateFilter(period) {
  const now = new Date();

  if (period === "daily") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    return {
      createdAt: {
        $gte: start,
      },
    };
  }

  if (period === "weekly") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const day = start.getDay();
    const mondayOffset = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - mondayOffset);

    return {
      createdAt: {
        $gte: start,
      },
    };
  }

  return {};
}

function getPeriod(req, res) {
  const period = String(req.query.period || "")
    .trim()
    .toLowerCase();

  if (!PERIODS.includes(period)) {
    res.status(400).json({
      message: "Invalid period.",
      allowedPeriods: PERIODS,
    });

    return null;
  }

  return period;
}

function getMode(req, res) {
  const mode = String(req.query.mode || "")
    .trim()
    .toLowerCase();

  if (!GAME_MODES.includes(mode)) {
    res.status(400).json({
      message: "Invalid mode.",
      allowedModes: GAME_MODES,
    });

    return null;
  }

  return mode;
}

function getLimit(req) {
  const requestedLimit = Number.parseInt(req.query.limit, 10);

  if (!Number.isFinite(requestedLimit)) {
    return 20;
  }

  return Math.min(Math.max(requestedLimit, 1), 100);
}

function unrankedResponse(period, mode) {
  return {
    period,
    mode,
    rank: null,
    score: null,
    accuracy: null,
    correctClicks: null,
    incorrectClicks: null,
    gameMode: null,
    createdAt: null,
    ranked: false,
  };
}

export async function leaderboard(req, res) {
  try {
    const period = getPeriod(req, res);
    if (!period) return;

    const mode = getMode(req, res);
    if (!mode) return;

    const limit = getLimit(req);
    const minimumScore = MINIMUM_SCORE[period];

    const rows = await Game.aggregate([
      {
        $match: {
          ...dateFilter(period),
          mode,
          score: {
            $gte: minimumScore,
          },
          userId: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $lookup: {
          from: "auths",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $group: {
          _id: "$userId",
          userId: {
            $first: "$userId",
          },
          name: {
            $first: "$user.name",
          },
          nationality: {
            $first: "$user.nationality",
          },
          gameMode: {
            $first: "$mode",
          },
          accuracy: {
            $first: "$accuracy",
          },
          correctClicks: {
            $first: "$correctClicks",
          },
          incorrectClicks: {
            $first: "$incorrectClicks",
          },
          score: {
            $first: "$score",
          },
          createdAt: {
            $first: "$createdAt",
          },
          gameId: {
            $first: "$_id",
          },
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
          gameId: -1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    const leaderboardData = rows.map((game, index) => ({
      rank: index + 1,
      userId: game.userId,
      name: game.name || "Unknown",
      nationality: game.nationality || null,
      gameMode: game.gameMode,
      accuracy: game.accuracy,
      correctClicks: game.correctClicks,
      incorrectClicks: game.incorrectClicks,
      score: game.score,
      createdAt: game.createdAt,
    }));

    return res.status(200).json({
      period,
      mode,
      minimumScore,
      limit,
      leaderboard: leaderboardData,
    });
  } catch (error) {
    // console.error("Leaderboard error:", error);

    return res.status(500).json({
      message: "Failed to load leaderboard.",
    });
  }
}

export async function myRank(req, res) {
  try {
    const period = getPeriod(req, res);
    if (!period) return;

    const mode = getMode(req, res);
    if (!mode) return;

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        message: "Invalid user authentication.",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const minimumScore = MINIMUM_SCORE[period];

    const userBest = await Game.findOne({
      userId,
      mode,
      ...dateFilter(period),
      score: {
        $gte: minimumScore,
      },
    })
      .sort({
        score: -1,
        createdAt: -1,
        _id: -1,
      })
      .lean();

    if (!userBest) {
      return res.status(200).json(
        unrankedResponse(period, mode)
      );
    }

    const rankings = await Game.aggregate([
      {
        $match: {
          ...dateFilter(period),
          mode,
          score: {
            $gte: minimumScore,
          },
          userId: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $group: {
          _id: "$userId",
          userId: {
            $first: "$userId",
          },
          score: {
            $first: "$score",
          },
          accuracy: {
            $first: "$accuracy",
          },
          correctClicks: {
            $first: "$correctClicks",
          },
          incorrectClicks: {
            $first: "$incorrectClicks",
          },
          gameMode: {
            $first: "$mode",
          },
          createdAt: {
            $first: "$createdAt",
          },
          gameId: {
            $first: "$_id",
          },
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
          gameId: -1,
        },
      },
    ]);

    const userRankingIndex = rankings.findIndex(
      (row) =>
        row.userId?.toString() === userId.toString()
    );

    if (userRankingIndex === -1) {
      return res.status(200).json(
        unrankedResponse(period, mode)
      );
    }

    const userRanking = rankings[userRankingIndex];

    return res.status(200).json({
      period,
      mode,
      rank: userRankingIndex + 1,
      score: userRanking.score,
      accuracy: userRanking.accuracy,
      correctClicks: userRanking.correctClicks,
      incorrectClicks: userRanking.incorrectClicks,
      gameMode: userRanking.gameMode,
      createdAt: userRanking.createdAt,
      ranked: true,
    });
  } catch (error) {
    // console.error("myRank error:", error);

    return res.status(500).json({
      message: "Failed to calculate rank.",
    });
  }
}