const BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "").trim();

export interface ConstitutionalArticle {
  article: string;
  text: string;
  relevance?: string;
}

export interface SuggestedAction {
  step: number;
  action: string;
  details?: string;
}

export interface EscalationOption {
  level: string;
  authority: string;
  description: string;
  when?: string;
}

export interface StructuredGuidanceResponse {
  success: boolean;
  issueSummary: string;
  relevantInformation: string;
  suggestedActions: SuggestedAction[];
  escalationOptions: EscalationOption[];
  documentationChecklist: string[];
  templateOutput: string;
  practicalReality: string;
  confidenceScore: number;
}

export const askQuestion = async (payload: {
  question: string;
  userConsent: boolean;
}): Promise<StructuredGuidanceResponse> => {
  const res = await fetch(`${BASE_URL}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  const data = await res.json();

  // Ensure structured response format
  return {
    success: data.success ?? true,
    issueSummary: data.issueSummary || "",
    relevantInformation: data.relevantInformation || "",
    suggestedActions: data.suggestedActions || [],
    escalationOptions: data.escalationOptions || [],
    documentationChecklist: data.documentationChecklist || [],
    templateOutput: data.templateOutput || "",
    practicalReality: data.practicalReality || "",
    confidenceScore: data.confidenceScore ?? 0,
  };
};