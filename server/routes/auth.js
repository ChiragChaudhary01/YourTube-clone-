import express from "express";
import { login, updateProfile } from "../Controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.patch("/update/:id", updateProfile);

export default authRouter;
