export interface TableInfo {
  name: string;
  description: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  sql?: string;
  tables?: Array<{ name: string; description: string }>;
  isLoading?: boolean;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
} 