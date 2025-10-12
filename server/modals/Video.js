import mongoose from "mongoose";

const videoSchema = mongoose.Schema(
  {
    videotitle: { type: String, required: true },
    filename: { type: String },
    filetype: { type: String, required: true },
    filesize: { type: Number, required: true },
    videochanel: { type: String, required: true },
    Like: { type: Number, default: 0 },
    Dislike: { type: Number, default: 0 },
    Views: { type: Number, default: 0 },
    uploader: { type: String },
    URL: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("videofiles", videoSchema);
