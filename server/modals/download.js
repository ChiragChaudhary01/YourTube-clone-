import mongoose from "mongoose";

const downloadSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "videofiles", required: true },
    videoTitle: { type: String },
    videoURL: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

downloadSchema.index({ userId: 1, createdAt: 1 });

export default mongoose.model("download", downloadSchema);


