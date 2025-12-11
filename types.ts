export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  previewUrl?: string; // For UI display
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}