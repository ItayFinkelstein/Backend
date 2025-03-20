import { FilterQuery } from "mongoose";
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

  async getWithPaging(req: Request, res: Response) {
    const page = req.query.page ? parseInt(req.query.page as string) : null; // Check if page is provided

    try {
      let posts;

      if (page) {
        const limit = parseInt(process.env.LIMIT_POST_FETCHING || "10", 10);
        const skip = (page - 1) * limit;
        posts = await postModel.find().skip(skip).limit(limit);

        const totalPostsAmount = await postModel.countDocuments();

        res.status(200).send({
          posts: posts,
          hasNextPage: skip + posts.length < totalPostsAmount,
        });
      } else {
        posts = await postModel.find();
        res.status(200).send({ posts });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async getByUser(req: Request, res: Response) {
    const userId = req.query.userId;
    const filterByUser: FilterQuery<InstanceType<typeof postModel>> = {};

    if (userId) {
      filterByUser.owner = userId;
    }

    try {
      const posts = await postModel.find(filterByUser);
      res.status(200).send({ posts });
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const postsController = new PostController(postModel);

export default postsController;
