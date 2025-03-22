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

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: The Files API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: The URL of the uploaded file
 *       example:
 *         url: "http://localhost:3000/storage/1679501234567.png"
 */

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: Successfully uploaded the file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: File upload failed
 *       500:
 *         description: Internal server error
 */
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
