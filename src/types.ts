export interface TableInfo {
  name: string;
  description: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sql?: string;
  tables?: {
    name: string;
    description: string;
  }[];
} 