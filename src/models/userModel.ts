import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IUser {
  _id?: string;
  email: string;
  type: string;
  name: string;
  iconImage?: string;
  password?: string;
  refreshTokens: string[];
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
  name: {
    type: String,
    required: true,
  },
  iconImage: {
    type: String,
  },
});

userSchema.index({ email: 1, type: 1 }, { unique: true }); // uniquness for the combination of email and type

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
