import { Router } from "express";
import usersController from "../controllers/user_controller";

const router = Router();

router.get("/", usersController.getAll.bind(usersController));

export default router;
