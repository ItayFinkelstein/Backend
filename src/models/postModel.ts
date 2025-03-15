import mongoose from "mongoose";

export interface IPost {
  _id?: string;
  message: string;
  owner: string;
  image?: string;
}
const postSchema = new mongoose.Schema<IPost>({
  message: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

export default mongoose.model("Post", postSchema);
