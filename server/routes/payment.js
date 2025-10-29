import express from "express";
import { getKey, createOrder, verifyPayment, paymentHealth } from "../Controllers/payment.js";

const router = express.Router();

router.get("/key", getKey);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/health", paymentHealth);

export default router;


