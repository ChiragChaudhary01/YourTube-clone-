import User from "../modals/Auth.js";
import mongoose from "mongoose";

export const login = async (req, res) => {
  const { email, name, image } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (!userExists) {
      try {
        const newUser = await User.create({ email, name, image });
        res.status(200).json({ result: newUser });
      } catch (error) {
        res.status(500).json({ error: "Somthing went wrongd" });
        return;
      }
    } else {
      res.status(200).json({ result: userExists });
    }
  } catch (error) {
    res.status(500).json({ error });
    return;
  }
};

export const updateProfile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ error: "Channel is unavilable" });
  }
  try {
    const updateData = await User.findByIdAndUpdate(
      _id,
      {
        $set: { channelname, description },
      },
      { new: true }
    );
    res.status(200).json(updateData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Somthing went wrongd" });
  }
};
