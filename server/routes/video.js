import express from "express";
import { uploadVideo, getAllVideo } from "../Controllers/video.js";
import upload from "../filehelper/config.js";

const videoRouter = express.Router();

videoRouter.post("/upload", upload.single("file"), uploadVideo);
videoRouter.get("/getall", getAllVideo);

export default videoRouter;
