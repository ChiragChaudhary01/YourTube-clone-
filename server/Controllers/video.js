import Video from "../modals/Video.js";

export const uploadVideo = async (req, res) => {
  const { videotitle, videochanel, uploader } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Please upload an MP4 video file" });
  }

  try {
    const file = new Video({
      videotitle,
      // filename: req.savedFilename, // original file name
      filetype: req.file.mimetype, // correct MIME type
      filesize: req.file.size, // number (in bytes)
      videochanel,
      uploader,
      URL: req.file.path,
    });

    console.log("URL", req.file.path);

    await file.save();

    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllVideo = async (req, res) => {
  try {
    const files = await Video.find().sort({ createdAt: -1 }); // newest first
    return res.status(200).send(files);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Somthing went wrong" });
  }
};
