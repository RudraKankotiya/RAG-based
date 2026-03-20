export interface Source {
  source: string;
  page: number;
  snippet: string;
}

export interface AskResponse {
  answer: string;
  risk_level: "Low" | "Medium" | "High";
  anomaly_score: number;
  confidence_score: number;
  reasoning_points: string[];
  sources: Source[];
  num_docs_retrieved: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: Partial<AskResponse>;
}
