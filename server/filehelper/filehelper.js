import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to save files
  },
  filename: (req, file, cb) => {
    // generate unique name for storage
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const savedName = file.fieldname + "-" + uniqueSuffix + ext;

    // 🟢 store both names for later use
    req.savedFilename = savedName;
    req.originalFilename = file.originalname;

    cb(null, savedName);
  },
});

const upload = multer({ storage });
export default upload;
