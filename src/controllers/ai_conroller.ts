import { Request, Response } from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const enhanceCaption = async (req: Request, res: Response) => {
    try {
        const caption = req.body.caption;
        if (!caption) {
            return res.status(400).json({ error: "Caption is required" });
        }

        const result = await model.generateContent(`You are a clever and social assistant, Enhance this social media post caption: "${caption}". make sure it's not more than 20 words. in your answer dont tell me what you did or anything like that. return simply the enhanced caption.`);
        const enhancedCaption = await result.response.text() || "Could not enhance caption.";

        res.json({ enhancedCaption });
    } catch (error) {
        console.error("Error enhancing caption:", error);
        res.status(500);
    }
};

export default { enhanceCaption };