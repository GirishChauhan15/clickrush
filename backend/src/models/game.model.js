import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    correctClicks: {
      type: Number,
      default: 0,
      min: 0,
      max: 1500,
    },

    incorrectClicks: {
      type: Number,
      default: 0,
      min: 0,
      max: 1500,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.index({ userId: 1, createdAt: -1 });
gameSchema.index({ score: -1, createdAt: -1 });
gameSchema.index({ mode: 1, score: -1 });
gameSchema.index({ userId: 1, score: -1 });

export default mongoose.model("Game", gameSchema);