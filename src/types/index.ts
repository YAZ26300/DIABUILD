export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

export interface DBTableNode {
  id: string;
  type: 'dbTable';
  data: {
    label: string;
    fields: Array<{
      name: string;
      type: string;
      isPrimary?: boolean;
      isForeign?: boolean;
    }>;
  };
  position: { x: number; y: number };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
} 