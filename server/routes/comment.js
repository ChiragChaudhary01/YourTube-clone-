import express from "express";
import {
  getAllComment,
  postComment,
  deleteComment,
  editComment,
} from "../Controllers/comment.js";

const commentRouter = express.Router();

commentRouter.get("/:videoId", getAllComment);
commentRouter.post("/:videoId", postComment);
commentRouter.put("/:commentId", editComment);
commentRouter.delete("/:commentId", deleteComment);

export default commentRouter;
