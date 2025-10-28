import mongoose from "mongoose";

const commentReactionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
      required: true,
    },
    liked: { type: Boolean, default: false },
    disliked: { type: Boolean, default: false },
    reactedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

commentReactionSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export default mongoose.model("commentReaction", commentReactionSchema);


