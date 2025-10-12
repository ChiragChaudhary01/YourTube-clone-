import Video from "../modals/Video.js";
import Like from "../modals/like.js";

export const handleLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId, liked, disliked } = req.body;

    console.log("userId,videoId", userId, videoId);

    // 1️⃣ Find existing like document
    let existingLike = await Like.findOne({ viewer: userId, videoId });

    // 2️⃣ If it exists, adjust counts based on previous state
    if (existingLike) {
      // Handle Like
      if (existingLike.liked && !liked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      } else if (!existingLike.liked && liked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      }

      // Handle Dislike
      if (existingLike.disliked && !disliked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Dislike: -1 } });
      } else if (!existingLike.disliked && disliked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1 } });
      }
    } else {
      // 3️⃣ No existing like/dislike document: first-time action
      if (liked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      }
      if (disliked) {
        await Video.findByIdAndUpdate(videoId, { $inc: { Dislike: 1 } });
      }
    }

    // 4️⃣ Upsert the Like document (create if it doesn't exist)
    const likeDoc = await Like.findOneAndUpdate(
      { viewer: userId, videoId },
      { liked, disliked, likedOn: new Date() },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Like/Dislike updated", likeDoc });
  } catch (error) {
    console.error("Error in handleLike:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLikedVideo = async (req, res) => {
  const { userId, videoId } = req.params; // both from params
  try {
    const result = await Like.findOne({ viewer: userId, videoId });
    if (!result) {
      res.json({ liked: false, disliked: false });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllLikedVideos = async (req, res) => {
  const { userId } = req.params;
  try {
    const likedVideos = await Like.find({ viewer: userId, liked: true })
      .populate({
        path: "videoId",
        model: "videofiles",
      })
      .sort({ likedOn: -1 })
      .exec();
    return res.status(200).json(likedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
