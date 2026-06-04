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

export interface LegalQueryRequest {
  question: string;
  userConsent?: boolean;
}

export interface LegalQueryResponse extends StructuredGuidanceResponse {
  queryId?: string;
  error?: string;
  message?: string;
}

export interface LegalQuery {
  id: string;
  question: string;
  ai_response: string;
  confidence_score: number;
  created_at: string;
  user_consent_storage: boolean;
}
