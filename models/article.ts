import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    article_number: {
      type: String,
      required: true,
    },
    title: String,
    content: String,
  },
  { timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);