import postModel from "../models/postModel";
import BaseController from "./base_controller";
import { Request, Response } from "express";

class PostController extends BaseController<typeof postModel> {
  constructor(model: any) {
    super(model);
  }

  async createItem(req: Request, res: Response) {
    const userId = req.query.userId;
    const post = {
      ...req.body,
      owner: userId,
    };
    req.body = post;

    return super.createItem(req, res);
  }
}

const postsController = new PostController(postModel);

export default postsController;
