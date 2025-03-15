import commentModel from "../models/commentModel";
import BaseController from "./base_controller";
import { Request, Response } from "express";

class CommentController extends BaseController<typeof commentModel> {
    constructor(model: any) {
        super(model);
    }

    async createItem(req: Request, res: Response) {
        const userId = req.query.userId;
        const comment = {
            ...req.body,
            owner: userId
        }
        req.body = comment;

        return super.createItem(req, res);
    };
}

const commentsController = new CommentController(commentModel);

export default commentsController;