import express from "express";
import { getKey, createOrder, verifyPayment, paymentHealth, testSendEmail } from "../Controllers/payment.js";

const router = express.Router();

router.get("/key", getKey);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/health", paymentHealth);
router.get("/test/send-email", testSendEmail);

export default router;


