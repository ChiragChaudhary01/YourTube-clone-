import mongoose from "mongoose";
const likeSchema = mongoose.Schema(
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
    liked: Boolean,
    disliked: Boolean,
    likedOn: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("like", likeSchema);
