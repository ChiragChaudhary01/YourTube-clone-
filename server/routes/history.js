import express from "express";
import {
  getallwatchedVideos,
  handleHistory,
  handleView,
} from "../Controllers/history.js";

const historyRoutes = express.Router();
historyRoutes.get("/:userId", getallwatchedVideos);
historyRoutes.post("/views/:videoId", handleView);
historyRoutes.post("/:videoId", handleHistory);
export default historyRoutes;
