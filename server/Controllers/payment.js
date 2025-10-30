import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../modals/Auth.js";
import { sendInvoiceEmail, getEmailProvider } from "../services/emailService.js";

// Support both standard and test env variable names
const key_id = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_TEST || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_TEST_SECRET || "";

let razorpay;
try {
  if (key_id && key_secret) {
    razorpay = new Razorpay({ key_id, key_secret });
  } else {
    console.warn("Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
} catch (e) {
  console.error("Razorpay init failed", e);
}

export const getKey = async (req, res) => {
  if (!key_id) {
    return res.status(500).json({ message: "Razorpay key not configured on server. Set RAZORPAY_KEY_ID (or RAZORPAY_TEST)." });
  }
  return res.status(200).json({ key: key_id });
};

export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "Payment gateway not configured. Set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET and restart server." });
    }
    const { amount, planType } = req.body; // amount in paise
    const options = {
      amount: amount || 1000,
      currency: "INR",
      notes: { planType: planType || "Bronze" },
    };
    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (e) {
    console.error("Create order failed:", e?.message || e);
    return res.status(500).json({ message: e?.error?.description || e?.message || "Failed to create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!key_secret) {
      return res.status(500).json({ message: "Payment verification not configured. Missing server secret." });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planType, amount } = req.body;
    const hmac = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const valid = hmac === razorpay_signature;
    if (!valid) return res.status(400).json({ message: "Invalid signature" });
    // Map plan to limits
    const planMap = {
      Bronze: { minutes: 7, amount: 1000 },
      Silver: { minutes: 10, amount: 5000 },
      Gold: { minutes: 0, amount: 10000 }, // 0 = unlimited
    };
    const chosen = planMap[planType] || planMap.Bronze;
    // Update user plan
    const update = {
      planType: planType || "Bronze",
      planAmount: typeof amount === 'number' ? amount : chosen.amount,
      planDurationLimit: chosen.minutes,
      paymentStatus: "success",
      isPremium: planType === 'Gold',
    };
    await User.findByIdAndUpdate(userId, update);

    // Generate a simple PDF invoice (in-memory buffer)
    try {
      async function generateInvoicePdf({ user, update, razorpay_payment_id }) {
        try {
          const PDFDocument = (await import('pdfkit')).default;
          const doc = new PDFDocument({ size: 'A4', margin: 50 });

          const chunks = [];
          return await new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc
              .fontSize(20)
              .text('YourTube', { align: 'left' })
              .moveDown(0.5)
              .fontSize(12)
              .text('Plan Purchase Invoice', { align: 'left' })
              .moveDown();

            // Buyer details
            doc
              .fontSize(10)
              .text(`Name: ${user.name || ''}`)
              .text(`Email: ${user.email}`)
              .moveDown();

            // Invoice details
            const amountInRupees = (update.planAmount / 100).toFixed(2);
            const durationText = update.planType === 'Gold' ? 'Unlimited' : `${update.planDurationLimit} minutes`;
            doc
              .fontSize(12)
              .text(`Plan: ${update.planType}`)
              .text(`Amount: ₹${amountInRupees}`)
              .text(`Duration Limit: ${durationText}`)
              .text(`Payment ID: ${razorpay_payment_id}`)
              .text(`Date: ${new Date().toLocaleString()}`)
              .moveDown();

            // Footer
            doc
              .fontSize(9)
              .fillColor('#666')
              .text('Thank you for your purchase! Enjoy watching.', { align: 'center' });

            doc.end();
          });
        } catch (e) {
          return null;
        }
      }

      const user = await User.findById(userId);
      if (user?.email) {
        const pdfBuffer = await generateInvoicePdf({ user, update, razorpay_payment_id: razorpay_payment_id });
        const result = await sendInvoiceEmail({ user, update, razorpayPaymentId: razorpay_payment_id, pdfBuffer });
        if (result.ok) {
          console.info(`Invoice email sent via ${result.provider}:`, result.id || 'no-id');
        } else {
          console.warn(`Invoice email failed via ${result.provider}:`, result.error || 'unknown');
        }
      }
    } catch (mailErr) {
      console.warn('Email send failed:', mailErr?.message || mailErr);
      if (mailErr?.stack) console.warn(mailErr.stack);
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error("Verify payment failed:", e?.message || e);
    return res.status(500).json({ message: e?.message || "Verification failed" });
  }
};

export const paymentHealth = async (req, res) => {
  try {
    return res.status(200).json({
      hasKeyId: Boolean(key_id),
      hasKeySecret: Boolean(key_secret),
      razorpayInitialized: Boolean(razorpay),
      emailProvider: getEmailProvider(),
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasBrevoKey: Boolean(process.env.BREVO_API_KEY),
      hasBrevoFromEmail: Boolean(process.env.BREVO_FROM_EMAIL),
    });
  } catch (e) {
    return res.status(500).json({ message: 'health error' });
  }
};

// Simple test route handler to validate email sending on Render.
// Protected by EMAIL_TEST_TOKEN to avoid abuse.
export const testSendEmail = async (req, res) => {
  try {
    const authHeader = req.headers['x-email-test-token'] || req.query.token;
    if (!process.env.EMAIL_TEST_TOKEN || authHeader !== process.env.EMAIL_TEST_TOKEN) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { to = '' } = req.query;
    if (!to) return res.status(400).json({ message: 'Missing to email' });

    // Build a tiny PDF buffer
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.fontSize(16).text('YourTube Test Invoice', { align: 'left' });
      doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
      doc.moveDown().text('This is a test email to validate provider configuration.');
      doc.end();
    });

    const fakeUser = { name: 'Test User', email: to };
    const update = { planType: 'Bronze', planAmount: 1000, planDurationLimit: 7 };
    const result = await sendInvoiceEmail({ user: fakeUser, update, razorpayPaymentId: 'test_payment_id', pdfBuffer });
    return res.status(200).json({ ok: result.ok, provider: result.provider, id: result.id, error: result.error });
  } catch (e) {
    return res.status(500).json({ message: e?.message || 'test-send-email failed' });
  }
};


