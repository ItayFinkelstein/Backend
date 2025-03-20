import { Request, Response } from "express";
import { Mongoose, Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    const ownerFilter = req.query.owner;
    const postIdFilter = req.query.postId;
    let filterParams = {};

    if (ownerFilter && postIdFilter) {
      filterParams = { owner: ownerFilter, postId: postIdFilter };
    } else if (ownerFilter) {
      filterParams = { owner: ownerFilter };
    } else if (postIdFilter) {
      filterParams = { postId: postIdFilter };
    }

    try {
      const items = await this.model.find(filterParams);
      res.status(200).send(items);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async getById(req: Request, res: Response) {
    const idToFind = req.params.id;

    if (Mongoose.prototype.isValidObjectId(idToFind)) {
      try {
        const items = await this.model.findById(idToFind);
        if (items) {
          res.status(200).send(items);
        } else {
          res.status(400).send(`invalid ObjectId`);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      res.status(400).send("invalid ObjectId");
    }
  }

  async createItem<P>(
    req: Request,
    res: Response,
    additionalAction?: () => Promise<void>
  ) {
    const itemToCreate = req.body;
    try {
      const newItem = await this.model.create(itemToCreate);
      if (additionalAction) {
        await additionalAction();
      }
      res.status(201).send(newItem);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async updateItemById(req: Request, res: Response) {
    const itemIdToUpdate = req.params.id;
    const item = req.body;

    if (Mongoose.prototype.isValidObjectId(itemIdToUpdate)) {
      try {
        const updatedItem = await this.model.findByIdAndUpdate(
          itemIdToUpdate,
          item,
          { new: true } // means return the item after the update was applied
        );
        if (updatedItem) {
          res.status(200).send(updatedItem);
        } else {
          res.status(404).send(`Item with id ${itemIdToUpdate} not found`);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      res.status(400).send("invalid ObjectId");
    }
  }

  async deleteItemById(req: Request, res: Response) {
    const itemIdToDelete = req.params.id;

    if (Mongoose.prototype.isValidObjectId(itemIdToDelete)) {
      try {
        const deletedItem = await this.model.findByIdAndDelete(itemIdToDelete);
        if (deletedItem) {
          res.status(200).send(`Item with id ${itemIdToDelete} deleted`);
        } else {
          res.status(404).send(`Item with id ${itemIdToDelete} not found`);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      return res.status(400).send("invalid ObjectId");
    }
  }
}

export default BaseController;
