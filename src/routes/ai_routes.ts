import { Router } from "express";
import aiController from "../controllers/ai_conroller";
import { authMiddleware } from "../controllers/auth_controller";

const aiRouter = Router();

aiRouter.post("/enhance-caption", authMiddleware, (req, res) => {
    aiController.enhanceCaption(req, res);
});

export default aiRouter;
