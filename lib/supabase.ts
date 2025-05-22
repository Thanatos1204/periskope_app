import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'periskope-chat-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to initialize Supabase listeners
export function initializeRealtimeListeners() {
  // Enable real-time for specific channels
  const channelA = supabase
    .channel('chats-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chats',
    }, (payload) => {
      console.log('Chats change received!', payload);
    })
    .subscribe();

  const channelB = supabase
    .channel('messages-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
    }, (payload) => {
      console.log('Messages change received!', payload);
    })
    .subscribe();

  const channelC = supabase
    .channel('chat_members-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chat_members',
    }, (payload) => {
      console.log('Chat members change received!', payload);
    })
    .subscribe();

  const channelD = supabase
    .channel('chat_labels-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chat_labels',
    }, (payload) => {
      console.log('Chat labels change received!', payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channelA);
    supabase.removeChannel(channelB);
    supabase.removeChannel(channelC);
    supabase.removeChannel(channelD);
  };
}

// Supabase database type for better type inference
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];