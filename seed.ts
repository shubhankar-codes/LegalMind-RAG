import dotenv from "dotenv";
dotenv.config();

import Article from "./models/article.ts";
import { extractArticles } from "./utils/parser.ts";
import { getEmbedding } from "./utils/embedding.ts";
import connectDB from "./config/db.ts";

const seed = async () => {
  await connectDB();

  const articles = await extractArticles();

  console.log("Total articles parsed:", articles.length);

  // Clear old data.
  await Article.deleteMany({});

  for (const art of articles) {
    const text = `${art.article_number} ${art.title} ${art.content}`;

    console.log("Embedding:", art.article_number);

    const embedding = await getEmbedding(text);

    await Article.create({
      ...art,
      embedding,
    });
  }

  console.log("Data inserted with embeddings");
  process.exit(0);
};

seed();