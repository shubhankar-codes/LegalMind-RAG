import fs from "fs";
import path from "path";

const OUTPUT_PATH = path.resolve(process.cwd(), "output.txt");

export const extractArticles = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    throw new Error(
      `Missing file at ${OUTPUT_PATH}. Run: pdftotext -layout COI.pdf output.txt`
    );
  }

  const text = fs.readFileSync(OUTPUT_PATH, "utf-8");
  const lines = text.split("\n");

  const articles: any[] = [];
  const seen = new Set(); // prevents duplicates

  let currentArticle: any = null;
  let startParsing = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    // Starts only after real content begins.
    if (!startParsing) {
      if (line.includes("1. Name and territory of the Union")) {
        startParsing = true;
      }
      continue;
    }

    // Match only clean article headings.
    const match = line.match(/^(\d{1,3})\.\s+(.+)/);

    if (match) {
      const num = parseInt(match[1], 10);
      const title = match[2].trim();

      // Hard filters.

      // valid article range
      if (num < 1 || num > 395) continue;

      // skip duplicates
      if (seen.has(num)) continue;

      // ignore amendment / substitution text
      if (
        title.toLowerCase().includes("subs.") ||
        title.toLowerCase().includes("inserted") ||
        title.toLowerCase().includes("omitted") ||
        title.toLowerCase().includes("amendment")
      ) {
        continue;
      }

      // ignore clauses
      if (/^\(\d+\)|^\([a-z]\)/i.test(title)) continue;

      // ignore garbage titles
      if (title.length < 8) continue;

      // ignore sections like PART / SCHEDULE
      if (
        title.toLowerCase().includes("part ") ||
        title.toLowerCase().includes("schedule")
      ) {
        continue;
      }

      // Save previous article before creating a new one.
      if (currentArticle) {
        articles.push(currentArticle);
      }

      // Create new article.
      currentArticle = {
        article_number: `Article ${num}`,
        title,
        content: "",
      };

      seen.add(num); // mark as used

    } else if (currentArticle) {
      // Append only meaningful content.
      if (line.length > 3) {
        currentArticle.content += " " + line;
      }
    }
  }

  // push last article
  if (currentArticle) {
    articles.push(currentArticle);
  }

  console.log("Total articles parsed:", articles.length);
  console.log("Sample:", articles.slice(0, 3));

  return articles;
};