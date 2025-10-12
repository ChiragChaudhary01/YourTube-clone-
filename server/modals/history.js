import mongoose from "mongoose";
const historySchema = mongoose.Schema(
  {
    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    whatchedOn: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("history", historySchema);
