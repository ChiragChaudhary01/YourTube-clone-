import watchlater from "../modals/watchLater.js";

export const handlewatchlater = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const exisitingwatchlater = await watchlater.findOne({
      viewer: userId,
      videoId,
    });
    if (exisitingwatchlater) {
      await watchlater.findByIdAndDelete(exisitingwatchlater._id);
      return res.status(200).json({ watchlater: false });
    } else {
      await watchlater.create({ viewer: userId, videoId });
      return res.status(200).json({ watchlater: true });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getWatchLaterVideo = async (req, res) => {
  const { userId, videoId } = req.params; // both from params
  try {
    const result = await watchlater.findOne({ viewer: userId, videoId });
    if (result) {
      return res.status(200).json({ watchlater: true });
    } else {
      return res.status(200).json({ watchlater: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallwatchlater = async (req, res) => {
  const { userId } = req.params;
  try {
    const watchlatervideo = await watchlater
      .find({ viewer: userId })
      .populate({
        path: "videoId",
        model: "videofiles",
      })
      .sort({ putOn: -1 })
      .exec();
    return res.status(200).json(watchlatervideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
