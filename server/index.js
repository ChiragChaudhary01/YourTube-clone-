import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import videoRouter from "./routes/video.js";
import likeRoutes from "./routes/like.js";
import watchLaterRoutes from "./routes/watchlater.js";
import historyRoutes from "./routes/history.js";
import commentRouter from "./routes/comment.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Trust reverse proxy headers for accurate client IP
app.set("trust proxy", true);

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Your backend is working");
});

app.use("/user", authRouter);
app.use("/video", videoRouter);
app.use("/like", likeRoutes);
app.use("/watch-later", watchLaterRoutes);
app.use("/history", historyRoutes);
app.use("/comment", commentRouter);

app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Mongodb connected");
    app.listen(PORT, () => {
      console.log("Server is running on port:", PORT);
    });
  })
  .catch((error) => console.error(error));

  // Checking the Push from another PC
