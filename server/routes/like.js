import express from "express";
import {
  handleLike,
  getAllLikedVideos,
  getLikedVideo,
} from "../Controllers/like.js";

const likeRoutes = express.Router();
likeRoutes.get("/all/:userId", getAllLikedVideos);
likeRoutes.get("/:userId/:videoId", getLikedVideo);
likeRoutes.post("/:videoId", handleLike);
export default likeRoutes;
