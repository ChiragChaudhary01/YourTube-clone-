import mongoose from "mongoose";
const commentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentBody: { type: String },
    userCommented: { type: String },
    commentedOn: { type: Date, default: Date.now },
    city: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentSchema);
