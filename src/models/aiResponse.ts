export interface response {
  action: string;
  category: string;
  summary: string;
}

export interface aiResponse {
  mailId: string;
  categoryId: string;
  aiResponse: string;
  aiResponseJSON?: response;
}
