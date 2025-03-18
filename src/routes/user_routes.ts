import { Router } from "express";
import usersController from "../controllers/user_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = Router();

router.get("/", usersController.getAll.bind(usersController));

router.put("/:id", authMiddleware, (req, res) => {
  usersController.updateItemById(req, res);
});

export default router;
