import Download from "../modals/download.js";
import User from "../modals/Auth.js";
import Video from "../modals/Video.js";

export const createDownload = async (req, res) => {
  try {
    const { userId, videoId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const now = new Date();
    // Expire premium if past due
    if (user.isPremium && user.premiumUntil && now > new Date(user.premiumUntil)) {
      user.isPremium = false;
      user.premiumUntil = undefined;
      await user.save();
    }
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!user.isPremium) {
      const countToday = await Download.countDocuments({ userId, createdAt: { $gte: startOfDay } });
      if (countToday >= 1) {
        return res.status(403).json({ message: "Daily download limit reached. Upgrade to premium." });
      }
    }

    const dl = await Download.create({
      userId,
      videoId,
      videoTitle: video.videotitle,
      videoURL: video.URL,
    });
    return res.status(200).json({ download: dl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listDownloads = async (req, res) => {
  try {
    const { userId } = req.params;
    const list = await Download.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(list);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
};


