import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.ts";
import Article from "./models/article.ts";
import { pipeline } from "@xenova/transformers";

let cachedArticles: any[] = [];
let embedder: any;

type OpenRouterError = {
  code?: number;
  message?: string;
  [key: string]: unknown;
};

type OpenRouterChoice = {
  message?: {
    content?: unknown;
  };
};

type OpenRouterResponse = {
  error?: OpenRouterError;
  choices?: OpenRouterChoice[];
  [key: string]: unknown;
};

type QueryTag =
  | "criminal_procedure_arrest"
  | "speech_expression"
  | "equality_discrimination"
  | "general";

type RetrievalResult = {
  articles: any[];
  queryTag: QueryTag;
  legalGrounding: string;
};

connectDB();

const loadArticles = async () => {
  console.log("Loading articles...");
  cachedArticles = await Article.find();
  console.log(`Loaded ${cachedArticles.length} articles`);
};
await loadArticles();

const app = express();
const PORT = Number(process.env.PORT || process.env.API_PORT) || 5000;

app.use(cors());
app.use(express.json());

const LegalQuerySchema = new mongoose.Schema({
  question: String,
  ai_response: String,
  constitutional_articles: Array,
  confidence_score: Number,
  created_at: { type: Date, default: Date.now },
  user_consent_storage: Boolean,
});

const LegalQuery = mongoose.model("LegalQuery", LegalQuerySchema);

const getEmbedding = async (text: string) => {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data) as number[];
};

const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB || 1);
};

const normalizeModelContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return JSON.stringify(content);
  }
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }
  return "";
};

const parseStructuredJson = (content: unknown) => {
  const raw = normalizeModelContent(content).replace(/```json|```/g, "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = raw.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
};

const toStructuredResponse = (candidate: any, fallback: any) => {
  const safe = candidate && typeof candidate === "object" ? candidate : {};

  const suggestedActions = Array.isArray(safe.suggestedActions)
    ? safe.suggestedActions
        .filter((s: any) => s && typeof s === "object")
        .map((s: any, idx: number) => ({
          step: Number(s.step) || idx + 1,
          action: typeof s.action === "string" ? s.action : "Take appropriate action",
          details: typeof s.details === "string" ? s.details : "",
        }))
    : fallback.suggestedActions;

  const escalationOptions = Array.isArray(safe.escalationOptions)
    ? safe.escalationOptions
        .filter((e: any) => e && typeof e === "object")
        .map((e: any) => ({
          level: typeof e.level === "string" ? e.level : "Authority",
          authority: typeof e.authority === "string" ? e.authority : "Relevant authority",
          description:
            typeof e.description === "string"
              ? e.description
              : "Escalate with complaint and supporting records.",
          when: typeof e.when === "string" ? e.when : "",
        }))
    : fallback.escalationOptions;

  const documentationChecklist = Array.isArray(safe.documentationChecklist)
    ? safe.documentationChecklist.filter((i: any) => typeof i === "string")
    : fallback.documentationChecklist;

  return {
    success: true,
    issueSummary:
      typeof safe.issueSummary === "string"
        ? safe.issueSummary
        : fallback.issueSummary,
    relevantInformation:
      typeof safe.relevantInformation === "string"
        ? safe.relevantInformation
        : fallback.relevantInformation,
    suggestedActions:
      suggestedActions.length > 0 ? suggestedActions : fallback.suggestedActions,
    escalationOptions:
      escalationOptions.length > 0 ? escalationOptions : fallback.escalationOptions,
    documentationChecklist:
      documentationChecklist.length > 0
        ? documentationChecklist
        : fallback.documentationChecklist,
    templateOutput:
      typeof safe.templateOutput === "string"
        ? safe.templateOutput
        : fallback.templateOutput,
    practicalReality:
      typeof safe.practicalReality === "string"
        ? safe.practicalReality
        : fallback.practicalReality,
    confidenceScore:
      typeof safe.confidenceScore === "number"
        ? safe.confidenceScore
        : fallback.confidenceScore,
  };
};

const classifyQuery = (query: string): QueryTag => {
  const q = query.toLowerCase();
  if (
    q.includes("arrest") ||
    q.includes("detention") ||
    q.includes("custody") ||
    q.includes("police") ||
    q.includes("fir") ||
    q.includes("bail")
  ) {
    return "criminal_procedure_arrest";
  }
  if (
    q.includes("speech") ||
    q.includes("expression") ||
    q.includes("assembly") ||
    q.includes("protest")
  ) {
    return "speech_expression";
  }
  if (
    q.includes("discrimination") ||
    q.includes("equality") ||
    q.includes("equal treatment")
  ) {
    return "equality_discrimination";
  }
  return "general";
};

const getLegalGrounding = (tag: QueryTag) => {
  if (tag === "criminal_procedure_arrest") {
    return `If query involves arrest/detention:
- Constitutional safeguards: Article 21, Article 22, and Article 20(3) where applicable.
- CrPC safeguards: Sections 41 (grounds of arrest), 50 (grounds + bail right disclosure), 57 (produce before magistrate within 24 hours).
- D.K. Basu guidelines: arrest memo, relative/friend intimation, medical examination, custody records, and procedural transparency.`;
  }
  if (tag === "speech_expression") {
    return `If query involves speech/expression:
- Constitutional safeguards: Article 19(1)(a), read with reasonable restrictions under Article 19(2).
- Evaluate only restrictions that are lawful, necessary, and tied to statutory authority.`;
  }
  if (tag === "equality_discrimination") {
    return `If query involves discrimination/equality:
- Constitutional safeguards: Article 14 and Article 15 as factually relevant.
- Identify comparator treatment and state action context before applying remedies.`;
  }
  return `Apply only provisions that are directly relevant to the user's facts. Map constitutional rights first, then procedural safeguards, then escalation routes.`;
};

const getKeywordSet = (query: string, tag: QueryTag) => {
  const base = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);

  const boosters: Record<QueryTag, string[]> = {
    criminal_procedure_arrest: [
      "arrest",
      "detention",
      "custody",
      "liberty",
      "bail",
      "fir",
      "magistrate",
      "article 21",
      "article 22",
      "crpc 41",
      "crpc 50",
      "crpc 57",
      "dk basu",
    ],
    speech_expression: ["speech", "expression", "assembly", "protest", "article 19"],
    equality_discrimination: ["equality", "discrimination", "article 14", "article 15"],
    general: [],
  };

  return new Set([...base, ...boosters[tag]]);
};

const scoreKeywordMatch = (text: string, keywordSet: Set<string>) => {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const kw of keywordSet) {
    if (haystack.includes(kw)) score += 1;
  }
  return score;
};

const searchArticles = async (query: string): Promise<RetrievalResult> => {
  const cleanQuery = query.toLowerCase().trim();
  const queryTag = classifyQuery(cleanQuery);
  const legalGrounding = getLegalGrounding(queryTag);
  const keywordSet = getKeywordSet(cleanQuery, queryTag);
  const boostedArticleRegex: Record<QueryTag, RegExp | null> = {
    criminal_procedure_arrest: /Article\s*(20|21|22)/i,
    speech_expression: /Article\s*19/i,
    equality_discrimination: /Article\s*(14|15)/i,
    general: null,
  };

  // Direct article mention has top priority.
  const directArticleMatch = cleanQuery.match(/article\s*(\d+)/i);
  if (directArticleMatch) {
    const num = directArticleMatch[1];
    const exact = await Article.find({
      article_number: new RegExp(`Article\\s*${num}`, "i"),
    });
    if (exact.length > 0) return { articles: exact, queryTag, legalGrounding };
  }

  const embedding = await getEmbedding(cleanQuery);
  const boostedRegex = boostedArticleRegex[queryTag];
  const scored = cachedArticles
    .map((a) => {
      const semanticScore = a.embedding?.length
        ? cosineSimilarity(embedding, a.embedding)
        : 0;
      const corpus = `${a.article_number || ""} ${a.title || ""} ${a.content || ""}`;
      const keywordScore = scoreKeywordMatch(corpus, keywordSet);
      const tagBoost =
        boostedRegex && boostedRegex.test(a.article_number || "") ? 0.4 : 0;
      const hybridScore = semanticScore + keywordScore * 0.08 + tagBoost;

      return {
        article: a,
        hybridScore,
      };
    })
    .filter((item) => item.hybridScore >= 0.35)
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 4);

  // For tagged legal categories, ensure core constitutional anchors are available.
  if (boostedRegex) {
    const anchors = await Article.find({ article_number: boostedRegex }).limit(3);
    const mergedMap = new Map<string, any>();
    for (const item of scored) {
      mergedMap.set(String(item.article._id), item.article);
    }
    for (const a of anchors) {
      mergedMap.set(String(a._id), a);
    }
    const merged = Array.from(mergedMap.values()).slice(0, 5);
    return { articles: merged, queryTag, legalGrounding };
  }

  return { articles: scored.map((s) => s.article), queryTag, legalGrounding };
};

const callAI = async (
  question: string,
  articles: any[],
  queryTag: QueryTag,
  legalGrounding: string
) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return formatAnswer(articles);

    const context = articles
      .map(
        (a) =>
          `${a.article_number}: ${a.title}\n${a.content.slice(0, 400)}`
      )
      .join("\n\n");

    const messages = [
      {
        role: "system",
        content: `You are a legal assistant specialized in Indian law.
Provide actionable, legally grounded informational guidance only. Do NOT provide illegal advice.

Always return valid JSON in this EXACT shape:
{
  "issueSummary": "Section A content only",
  "relevantInformation": "Section B content only",
  "suggestedActions": [
    {"step": 1, "action": "Imperative action", "details": "Concrete instruction"},
    {"step": 2, "action": "Imperative action", "details": "Concrete instruction"}
  ],
  "escalationOptions": [
    {"level": "Police Hierarchy", "authority": "SP/DCP", "description": "How and what to file", "when": "When to escalate"},
    {"level": "Magistrate", "authority": "Jurisdictional Magistrate (CrPC 156(3))", "description": "Relief sought and filing route", "when": "When police inaction/refusal occurs"},
    {"level": "Human Rights", "authority": "NHRC/SHRC", "description": "Human-rights complaint route", "when": "When rights violations by public authorities are involved"}
  ],
  "documentationChecklist": [
    "Specific evidence item 1",
    "Specific evidence item 2"
  ],
  "templateOutput": "Formal ready-to-use complaint/application text only",
  "practicalReality": "Section G content only",
  "confidenceScore": 75
}

Map sections exactly as follows:
A. Issue Summary -> issueSummary
- Briefly restate the user's situation using only user-provided facts.

B. Legal Position -> relevantInformation
- Mention ONLY relevant Indian laws (Constitution, CrPC, IPC, and other directly relevant statutes).
- Do not include irrelevant provisions.
- Explain legal rights simply and precisely.
- You MUST identify applicable legal provisions from the query context.
- Do NOT say "cannot be determined" when generally applicable rights/safeguards exist.
- Always map at least constitutional rights and procedural safeguards where applicable.
- Prefer jurisdiction-aware mapping:
  - Constitution: Article 21, Article 22, Article 20(3) where factually relevant
  - Statutes: relevant CrPC and IPC provisions only
  - Authorities: Police hierarchy, Magistrate, NHRC/SHRC

C. Immediate Actions -> suggestedActions
- Provide step-by-step actions to take now.
- Use imperative style (e.g., "Ask", "Record", "Do not sign").
- Every step must answer: what should the user do next right now.

D. Remedies & Escalation -> escalationOptions
- Include clear escalation routes and when to use them:
  1) Police hierarchy: SP/DCP
  2) Magistrate: CrPC 156(3)
  3) Human rights bodies: NHRC (or SHRC where relevant)
- Add a decision-flow style where relevant:
  - If detained -> assert Article 22 safeguards
  - If FIR is refused -> escalate to SP/DCP, then Magistrate under CrPC 156(3)
  - If abuse by public authority continues -> approach NHRC/SHRC

E. Evidence Checklist -> documentationChecklist
- List exactly what evidence/documents to collect.
- Prefer: dates/times, officer identity details, safe audio/video, witness details, written acknowledgments.

F. Ready-to-Use Draft -> templateOutput
- Generate a concise, usable formal complaint/application based only on given facts.
- Use proper legal formatting and placeholders only where facts are missing.
- Prefer a ready complaint letter or formal email format when suitable.

G. Practical Reality Check -> practicalReality
- Mention practical constraints: delays, risks, and when to involve a lawyer.
- Keep tone neutral, procedural, and realistic. Do not over-promise outcomes.

Output rules:
- Be precise, not verbose.
- No emotional/motivational language.
- No assumptions beyond user input.
- No irrelevant legal content.
- Prioritize actionability.
- Assume Indian jurisdiction unless user says otherwise.
- Emphasize lawful remedies only.`,
      },
      {
        role: "user",
        content: `User Situation: ${question}
Query Classification Tag: ${queryTag}
Mandatory Legal Grounding:
${legalGrounding}

Legal Context (for reference):
${context || "No specific articles found. Provide general guidance based on common procedures."}

Generate structured guidance for this situation. Remember: this is informational guidance only, not legal advice.`,
      },
    ];

    const makeRequest = async (maxTokens: number, reqMessages = messages) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: maxTokens,
          messages: reqMessages,
          response_format: { type: "json_object" },
        }),
      });

    let response = await makeRequest(1200);
    let data = (await response.json()) as OpenRouterResponse;

    // Retry with a smaller output budget when account credits are tight.
    if (data.error?.code === 402) {
      response = await makeRequest(700);
      data = (await response.json()) as OpenRouterResponse;
    }

    if (data.error) {
      console.log("AI ERROR:", data.error);
      return formatAnswer(articles);
    }

    const aiContent = data.choices?.[0]?.message?.content;
    let parsed = parseStructuredJson(aiContent);

    // Some providers occasionally emit truncated JSON. Do one repair pass before falling back.
    if (!parsed) {
      const rawOutput = normalizeModelContent(data.choices?.[0]?.message?.content);
      const repairMessages = [
        {
          role: "system",
          content:
            "You are a JSON repair assistant. Return only valid JSON. Do not add explanations.",
        },
        {
          role: "user",
          content: `Fix this into valid JSON with the exact same keys and intent:\n\n${rawOutput}`,
        },
      ];

      const repairResponse = await makeRequest(1200, repairMessages as any);
      const repairData = (await repairResponse.json()) as OpenRouterResponse;
      parsed = parseStructuredJson(repairData.choices?.[0]?.message?.content);
    }

    if (parsed) return toStructuredResponse(parsed, formatAnswer(articles));

    // Silent fallback: avoid noisy terminal parse errors for malformed provider output.
    return formatAnswer(articles);
  } catch (err) {
    console.log("AI request fallback:", err instanceof Error ? err.message : "unknown");
    return formatAnswer(articles);
  }
};

const formatAnswer = (articles: any[]) => {
  if (!articles.length) {
    return {
      success: true,
      issueSummary:
        "Your situation is noted. Specific legal provisions cannot be mapped reliably from the available details alone.",
      relevantInformation:
        "Under Indian law, rights and remedies depend on facts and records. Use Constitution protections and relevant CrPC/IPC provisions only when they match the incident details. If the issue is regulatory (for example traffic enforcement), use the specific governing law and local authority process instead of unrelated constitutional provisions.",
      suggestedActions: [
        {
          step: 1,
          action: "Write a Chronology",
          details: "Record date, time, location, persons involved, and exact sequence of events.",
        },
        {
          step: 2,
          action: "Preserve Evidence",
          details:
            "Save messages, calls, documents, photos/videos, and any written acknowledgments without altering originals.",
        },
        {
          step: 3,
          action: "Submit a Written Complaint",
          details:
            "File a concise written complaint with the relevant police station/authority and ask for diary/acknowledgment details.",
        },
      ],
      escalationOptions: [
        {
          level: "Police Hierarchy",
          authority: "SP/DCP",
          description: "Escalate with copy of prior complaint and non-action details.",
          when: "Use when police station does not register or act on complaint.",
        },
        {
          level: "Magistrate",
          authority: "Jurisdictional Magistrate (CrPC 156(3))",
          description: "Seek direction for registration/investigation through court process.",
          when: "Use after documented police inaction/refusal.",
        },
        {
          level: "Human Rights",
          authority: "NHRC/SHRC",
          description: "File rights-violation complaint with supporting records.",
          when: "Use for custodial abuse, unlawful detention, or continuing rights violations by public authorities.",
        },
      ],
      documentationChecklist: [
        "Incident date/time timeline",
        "Names, rank, and badge/ID details of officers/officials (if applicable)",
        "Written complaints and acknowledgment/diary/receipt numbers",
        "Photos/videos/audio recordings (only where safe and lawful)",
        "Witness names and contact details",
        "Medical documents or injury records (if any)",
      ],
      templateOutput:
        "To,\nThe Station House Officer\n[Police Station Name], [District], [State]\n\nSubject: Complaint regarding [brief incident]\n\nRespected Sir/Madam,\n\nI, [Name], resident of [Address], submit this complaint regarding an incident on [Date] at [Time] at [Location].\n\nFacts:\n1) [Fact 1]\n2) [Fact 2]\n3) [Fact 3]\n\nI request registration of my complaint and lawful action as per applicable law. Kindly provide acknowledgment/diary number for this complaint.\n\nEnclosures: [list of documents/evidence]\n\nDate: [DD/MM/YYYY]\nPlace: [City]\n\nSignature:\n[Name]\n[Mobile Number]",
      practicalReality:
        "Complaints and escalations can take time. Preserve all records and escalate in sequence. If detention risk, repeated harassment, or serious criminal allegations are involved, consult a criminal lawyer before filing repeated or complex proceedings.",
      confidenceScore: 40,
    };
  }

  const main = articles[0];

  return {
    success: true,
    issueSummary: `Your situation appears related to **${main.article_number}** - ${main.title}.`,
    relevantInformation: `${main.content.slice(0, 500)}...\n\nUse this only if it directly matches your facts. If your issue is primarily statutory or regulatory (for example traffic or local compliance), rely on the specific law/procedure that governs that area.`,
    suggestedActions: [
      {
        step: 1,
        action: "Understand Your Rights",
        details: `Review the relevant constitutional provisions: ${main.article_number}`,
      },
      {
        step: 2,
        action: "Document Your Situation",
        details: "Gather all relevant documents, dates, times, and witness information",
      },
      {
        step: 3,
        action: "Seek Professional Guidance",
        details: "Consult with a qualified legal professional in your jurisdiction",
      },
    ],
    escalationOptions: [
      {
        level: "Police Hierarchy",
        authority: "SP/DCP",
        description: "Escalate with copy of complaint and request supervisory intervention.",
        when: "When police station delays or refuses to act.",
      },
      {
        level: "Magistrate",
        authority: "Jurisdictional Magistrate (CrPC 156(3))",
        description: "Seek court direction to register and investigate.",
        when: "When police inaction/refusal continues after escalation.",
      },
      {
        level: "Human Rights",
        authority: "NHRC/SHRC",
        description: "File complaint for ongoing rights violations by public authorities.",
        when: "When abuse, unlawful detention, or rights violations persist.",
      },
    ],
    documentationChecklist: [
      "Relevant correspondence and communications",
      "Identification documents",
      "Official notices and records",
      "Photographic/video evidence (where legally appropriate)",
      "Witness contact information and statements",
      "Timeline of events",
    ],
    templateOutput: `[SAMPLE - Customize based on your specific situation]

TO [AUTHORITY/RECIPIENT]:

RE: [Brief subject of your matter]

Dear Sir/Madam,

I respectfully [submit complaint / seek guidance / request action] regarding the following matter:

[Describe your situation clearly in numbered points]

Based on the relevant law(s), particularly [mention relevant articles/acts], I believe [state what you believe should happen].

I request that you [state what you are requesting].

Thank you for your attention to this matter.

Respectfully,
[Your Name]
[Date]
[Contact Information]`,
    practicalReality:
      "**Important:** Legal processes take time and involve multiple steps. Outcomes are not guaranteed. Consult a qualified legal professional early to understand realistic timelines, costs, and your specific options. Document everything from the start.",
    confidenceScore: 65,
  };
};

app.post("/api/query", async (req: Request, res: Response) => {
  try {
    const { question, userConsent = false } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    const { articles, queryTag, legalGrounding } = await searchArticles(question);
    const aiResponse = await callAI(question, articles, queryTag, legalGrounding);

    if (userConsent) {
      try {
        await LegalQuery.create({
          question,
          ai_response: JSON.stringify(aiResponse),
          confidence_score: aiResponse.confidenceScore,
          user_consent_storage: true,
        });
      } catch (dbError) {
        console.error("Database storage error:", dbError);
        // Continue even if storage fails
      }
    }

    res.json(aiResponse);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error", message: err instanceof Error ? err.message : "Unknown error" });
  }
});

app.get("/api/queries", async (_, res) => {
  const data = await LegalQuery.find().sort({ created_at: -1 });
  res.json(data);
});

app.get("/", (_, res) => {
  res.send("Backend running");
});

const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Stop the existing server process and restart.`
      );
      return;
    }
    throw error;
  });
};

startServer(PORT);