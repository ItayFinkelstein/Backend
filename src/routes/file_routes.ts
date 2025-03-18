import express, { Request, Response } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";

const router = express.Router();

const base = process.env.DOMAIN_BASE + "/";
const storage: StorageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'storage/');
    },
    filename: (req, file, callback) => {
        const fileExtension = path.extname(file.originalname);
        callback(null, `${Date.now()}${fileExtension}`);
    }
});

const upload = multer({ storage });

router.post('/', upload.single("file"), (req: Request, res: Response): void => {
    if (!req.file) {
        res.status(400).send({ error: "File upload failed" });
        return;
    }

    const fileUrl = `${base}${req.file.path}`;
    console.log(`router.post(/file): ${fileUrl}`);
    res.status(200).send({ url: fileUrl });
});

export default router;