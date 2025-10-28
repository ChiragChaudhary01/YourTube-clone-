import express from "express";
import {
  getAllComment,
  postComment,
  deleteComment,
  editComment,
  reactToComment,
  translateComment,
} from "../Controllers/comment.js";

const commentRouter = express.Router();

commentRouter.get("/:videoId", getAllComment);
commentRouter.post("/:videoId", postComment);
commentRouter.put("/:commentId", editComment);
commentRouter.delete("/:commentId", deleteComment);
commentRouter.post("/:commentId/react", reactToComment);
commentRouter.post("/:commentId/translate", translateComment);

export default commentRouter;
