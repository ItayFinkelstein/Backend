import mongoose from "mongoose";

export interface IPost {
  _id?: string;
  title: string;
  message: string;
  owner: string;
  image?: string;
  publishDate?: Date;
  likes: string[];
  commentAmount: number;
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
  publishDate: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  likes: {
    type: [String],
    default: [],
  },
  commentAmount: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default mongoose.model("Post", postSchema);
