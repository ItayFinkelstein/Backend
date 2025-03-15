import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  _id?: string;
  email: string;
  name: string;
  password: string;
  refreshTokens: string[];
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
  name: {
    type: String,
    required: true,
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
