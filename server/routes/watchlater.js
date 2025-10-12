import express from "express";
import {
  getallwatchlater,
  handlewatchlater,
  getWatchLaterVideo,
} from "../Controllers/watchlater.js";

const watchLaterRoutes = express.Router();
watchLaterRoutes.get("/all/:userId", getallwatchlater);
watchLaterRoutes.get("/:userId/:videoId", getWatchLaterVideo);
watchLaterRoutes.post("/:videoId", handlewatchlater);
export default watchLaterRoutes;
