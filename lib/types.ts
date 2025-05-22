export interface User {
  id: string;
  phone: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message_id?: string;
  last_message?: Message | Message[];
  members?: ChatMember[];
  labels?: ChatLabel[];
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  sender?: User;
  content?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  delivered: boolean;
  read: boolean;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  user?: User;
  created_at: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface ChatLabel {
  id: string;
  chat_id: string;
  label_id: string;
  label?: Label;
  created_at: string;
}