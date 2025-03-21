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
    const userId = req.query.userId as string;

    try {
      let posts;

      let filter: FilterQuery<InstanceType<typeof postModel>> = {};
      if (userId !== undefined) {
        filter.owner = userId;
      }

      if (page !== undefined && page !== null) {
        const limit = parseInt(process.env.POST_PAGING_SIZE || "10", 10);
        const skip = (page - 1) * limit;
        posts = await postModel
          .find(filter)
          .sort({ publishDate: -1 })
          .skip(skip)
          .limit(limit);
        const totalPostsAmount = await postModel.countDocuments(filter);

        res.status(200).send({
          posts: posts,
          hasNextPage: skip + posts.length < totalPostsAmount,
        });
      } else {
        posts = await postModel.find(filter);
        res.status(200).send({ posts, hasNextPage: false });
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
