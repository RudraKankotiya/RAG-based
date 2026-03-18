export interface Source {
  source: string;
  page: number;
  snippet: string;
}

export interface AskResponse {
  answer: string;
  risk_level: "Low" | "Medium" | "High";
  sources: Source[];
  num_docs_retrieved: number;
}
