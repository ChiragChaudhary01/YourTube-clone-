import mongoose from "mongoose";
const watchLaterSchema = mongoose.Schema(
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
    putOn: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("watch-later", watchLaterSchema);
