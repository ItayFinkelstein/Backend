import userModel from "../models/userModel";
import BaseController from "./base_controller";

class UserController extends BaseController<typeof userModel> {
  constructor(model: any) {
    super(model);
  }
}

const usersController = new UserController(userModel);

export default usersController;
