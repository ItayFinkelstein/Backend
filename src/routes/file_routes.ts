import express, { Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";

const fileRouter = express.Router();

const baseUrl = process.env.DOMAIN_BASE || "http://localhost:3000";
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/");
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, `${Date.now()}${fileExtension}`);
  },
});

const upload = multer({ storage });

fileRouter.post(
  "/",
  upload.single("file"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).send({ error: "File upload failed" });
      return;
    }
    const fileUrl = `${baseUrl}/storage/${req.file.filename}`;
    res.status(200).send({ url: fileUrl });
  }
);

export default fileRouter;
