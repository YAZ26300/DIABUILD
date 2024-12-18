export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  diagram?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
} 