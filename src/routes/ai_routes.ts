import { Router } from "express";
import aiController from "../controllers/ai_conroller";
import { authMiddleware } from "../controllers/auth_controller";

const aiRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhanceCaptionRequest:
 *       type: object
 *       required:
 *         - caption
 *       properties:
 *         caption:
 *           type: string
 *           description: The caption to enhance
 *           example: "Yesterday, I saw a beautiful sunset."
 *     EnhanceCaptionResponse:
 *       type: object
 *       properties:
 *         enhancedCaption:
 *           type: string
 *           description: The enhanced caption
 *           example: "Yesterday, I witnessed a breathtaking sunset with vibrant colors."
 */

/**
 * @swagger
 * /ai/enhance-caption:
 *   post:
 *     summary: Enhance a caption using AI
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhanceCaptionRequest'
 *     responses:
 *       200:
 *         description: Successfully enhanced the caption
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhanceCaptionResponse'
 *       400:
 *         description: Bad request, invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Caption is required"
 *       401:
 *         description: Unauthorized, authentication required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */
aiRouter.post("/enhance-caption", authMiddleware, (req, res) => {
  aiController.enhanceCaption(req, res);
});

export default aiRouter;
