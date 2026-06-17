// ============================================
// API Types
// ============================================

export interface ConstitutionalArticle {
  _id?: string;
  article_number: string;
  title: string;
  content: string;
}

export interface LegalQuery {
  _id?: string;
  question: string;
  ai_response: string;
  constitutional_articles: ConstitutionalArticle[];
  confidence_score: number;
  created_at: Date;
  user_consent_storage: boolean;
}

export interface QueryRequest {
  question: string;
  userConsent: boolean;
}

// ============================================
// AI Model Response Types
// ============================================

export interface SuggestedAction {
  step: number;
  action: string;
  details: string;
}

export interface EscalationOption {
  level: string;
  authority: string;
  description: string;
  when: string;
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

// ============================================
// Query Categorization Types
// ============================================

export type QueryTag =
  | "criminal_procedure_arrest"
  | "speech_expression"
  | "equality_discrimination"
  | "general";

export interface RetrievalResult {
  articles: ConstitutionalArticle[];
  queryTag: QueryTag;
  legalGrounding: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  success: false;
  error: string;
  details?: string;
}

// ============================================
// Environment Variables
// ============================================

export interface EnvironmentConfig {
  mongoUri: string;
  openRouterApiKey: string;
  port: number;
  nodeEnv: "development" | "production" | "test";
  viteApiUrl: string;
}
