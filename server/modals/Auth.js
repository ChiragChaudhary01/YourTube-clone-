import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date },
  planType: { type: String, enum: ["Free", "Bronze", "Silver", "Gold"], default: "Free" },
  planAmount: { type: Number, default: 0 }, // in INR paise
  planDurationLimit: { type: Number, default: 5 }, // in minutes for playback
  paymentStatus: { type: String, enum: ["none", "pending", "success", "failed"], default: "none" },
});

export default mongoose.model("user", userSchema);
