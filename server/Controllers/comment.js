import mongoose from "mongoose";
import comment from "../modals/comment.js";

export const postComment = async (req, res) => {
  const { videoId } = req.params;
  const { userId, commentBody, userCommented } = req.body;
  console.log(
    "{videoId,userId,commentBody,userCommented,}",
    videoId,
    userId,
    commentBody,
    userCommented
  );
  const postComment = new comment({
    videoId,
    userId,
    commentBody,
    userCommented,
  });
  try {
    await postComment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Somthing went wrong" });
  }
};

export const getAllComment = async (req, res) => {
  const { videoId } = req.params;
  try {
    const CommentsOfVideo = await comment
      .find({ videoId })
      .sort({ commentedOn: -1 }); // 👈 Newest first
    return res.status(200).json(CommentsOfVideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).send("Commnet unavailable");
  }
  try {
    await comment.findByIdAndDelete({ _id: commentId });
    return res.status(200).json("Comment deleted successfully");
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editComment = async (req, res) => {
  const { commentId } = req.params;
  const commentData = req.body;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(404).send("Commnet unavailable");
  }
  try {
    const updateComment = await comment.findByIdAndUpdate(
      { _id: commentId },
      { commentData }
    );
    res.status(200).json({ comment: true, updateComment });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
