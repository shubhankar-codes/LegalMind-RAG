import { pipeline } from "@xenova/transformers";

// load model once (singleton)
let extractorPromise: Promise<any> | null = null;

const getExtractor = async () => {
  if (!extractorPromise) {
    console.log("Loading embedding model...");
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return extractorPromise;
};

export const getEmbedding = async (text: string): Promise<number[]> => {
  const extractor = await getExtractor();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};