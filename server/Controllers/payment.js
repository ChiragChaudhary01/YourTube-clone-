import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../modals/Auth.js";

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

    // Send email invoice (non-blocking best-effort)
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      const user = await User.findById(userId);
      if (user?.email) {
        const html = `
          <h2>YourTube Plan Purchase Confirmation</h2>
          <p>Hi ${user.name || ''},</p>
          <p>Thank you for your purchase. Your plan has been upgraded.</p>
          <h3>Invoice</h3>
          <ul>
            <li><strong>Name:</strong> ${user.name || ''}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Plan:</strong> ${update.planType}</li>
            <li><strong>Amount:</strong> ₹${(update.planAmount/100).toFixed(2)}</li>
            <li><strong>Duration Limit:</strong> ${update.planType === 'Gold' ? 'Unlimited' : update.planDurationLimit + ' minutes'}</li>
            <li><strong>Payment ID:</strong> ${razorpay_payment_id}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Enjoy watching!</p>
        `;
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: user.email,
          subject: `YourTube: ${update.planType} Plan Activated`,
          html,
        });
      }
    } catch (mailErr) {
      console.warn('Email send failed:', mailErr?.message || mailErr);
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
    });
  } catch (e) {
    return res.status(500).json({ message: 'health error' });
  }
};


