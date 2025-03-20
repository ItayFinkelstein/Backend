import { Mongoose } from "mongoose";
import commentModel from "../models/commentModel";
import BaseController from "./base_controller";
import { Request, Response } from "express";
import postModel, { IPost } from "../models/postModel";

class CommentController extends BaseController<typeof commentModel> {
  constructor(model: any) {
    super(model);
  }

  async createItem(req: Request, res: Response) {
    return super.createItem(req, res, async () => {
      return incrementCommentAmount(req.body.postId);
    });
  }

  async getByPostId(req: Request, res: Response) {
    const idToFind = req.params.id;

    if (Mongoose.prototype.isValidObjectId(idToFind)) {
      try {
        const items = await commentModel.find({ postId: idToFind });
        res.status(200).send(items);
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      res.status(400).send("invalid ObjectId");
    }
  }
}

const commentsController = new CommentController(commentModel);

export default commentsController;

async function incrementCommentAmount(postId: string) {
  await postModel.findByIdAndUpdate(
    postId,
    { $inc: { commentAmount: 1 } },
    { new: true }
  );
}
