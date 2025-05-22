'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Chat, Message, User, ChatMember, Label, ChatLabel } from './types';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './auth-context';
import { 
  syncChats, 
  syncMessages, 
  syncUsers, 
  syncChatMembers, 
  syncLabels, 
  syncChatLabels,
  getAllItems,
  getMessagesByChat
} from './indexeddb';

type ChatContextType = {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  messages: Message[];
  sendMessage: (content: string, attachment?: File) => Promise<void>;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredChats: Chat[];
  activeLabels: string[];
  toggleLabel: (labelId: string) => void;
  labels: Label[];
  uploadAttachment: (file: File) => Promise<string>;
  refreshChats: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLabels, setActiveLabels] = useState<string[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  
  // Track the last message timestamp for polling
  const lastMessageTimestamp = useRef<string>('');
  const lastChatUpdate = useRef<string>('');
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const subscriptions = useRef<any[]>([]);
  
  const supabase = createClient();

  // Helper function to log errors properly
  const logError = (context: string, error: any) => {
    console.error(`${context}:`, {
      message: error?.message || 'Unknown error',
      code: error?.code || 'No code',
      details: error?.details || 'No details',
      hint: error?.hint || 'No hint',
      full_error: error
    });
  };

  // Function to fetch a complete chat with all its data
  const fetchCompleteChat = async (chatId: string) => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
        
      if (chatError) {
        logError('Error fetching chat data', chatError);
        return null;
      }
      
      // Fetch members
      const { data: members } = await supabase
        .from('chat_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('chat_id', chatId);
      
      // Fetch labels
      const { data: chatLabels } = await supabase
        .from('chat_labels')
        .select(`
          *,
          label:labels(*)
        `)
        .eq('chat_id', chatId);
      
      // Fetch last message
      let lastMessage = null;
      if (chatData.last_message_id) {
        const { data: messageData } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(*)
          `)
          .eq('id', chatData.last_message_id)
          .single();
        lastMessage = messageData;
      }
      
      return {
        ...chatData,
        members: members || [],
        labels: chatLabels || [],
        last_message: lastMessage
      };
    } catch (error) {
      logError('Error in fetchCompleteChat', error);
      return null;
    }
  };

  // Function to refresh chats (useful after creating new chats)
  const refreshChats = async () => {
    if (!user) return;
    
    try {
      console.log('Refreshing chats for user:', user.id);
      
      // Fetch chat members
      const { data: chatMembers, error: memberError } = await supabase
        .from('chat_members')
        .select('*')
        .eq('user_id', user.id);
        
      if (memberError) {
        logError('Error fetching chat members during refresh', memberError);
        return;
      }
      
      if (chatMembers && chatMembers.length > 0) {
        const chatIds = chatMembers.map((member) => member.chat_id);
        
        // Fetch all chats with complete data
        const processedChats = await Promise.all(
          chatIds.map(async (chatId) => {
            return await fetchCompleteChat(chatId);
          })
        );
        
        // Filter out null results and sort by updated_at
        const validChats = processedChats
          .filter(chat => chat !== null)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        
        setChats(validChats);
        
        // Update last chat update timestamp
        if (validChats.length > 0) {
          lastChatUpdate.current = new Date().toISOString();
        }
        
        console.log('Chats refreshed successfully:', validChats.length);
      } else {
        setChats([]);
      }
    } catch (error) {
      logError('Error refreshing chats', error);
    }
  };

  // Function to update chat order when a new message is received
  const updateChatWithNewMessage = async (messageData: Message) => {
    console.log('Updating chat with new message:', messageData);
    
    setChats(prevChats => {
      // Check if this chat already exists in our list
      const existingChatIndex = prevChats.findIndex(c => c.id === messageData.chat_id);
      
      if (existingChatIndex !== -1) {
        // Update existing chat
        console.log('Updating existing chat at index:', existingChatIndex);
        const updatedChats = [...prevChats];
        const chatToUpdate = { ...updatedChats[existingChatIndex] };
        
        // Update last message and timestamp
        chatToUpdate.last_message = messageData;
        chatToUpdate.updated_at = messageData.created_at;
        
        // Remove from current position and add to top
        updatedChats.splice(existingChatIndex, 1);
        return [chatToUpdate, ...updatedChats];
      } else {
        // Chat doesn't exist, we need to add it
        console.log('Chat not found in current list, will fetch and add it');
        
        // Trigger a fetch of the new chat (async operation)
        setTimeout(async () => {
          const completeChat = await fetchCompleteChat(messageData.chat_id);
          if (completeChat) {
            // Update the last message to include the sender info
            completeChat.last_message = messageData;
            
            setChats(currentChats => {
              // Double-check it's not already added
              const alreadyExists = currentChats.some(c => c.id === messageData.chat_id);
              if (alreadyExists) {
                console.log('Chat was already added by another process');
                return currentChats;
              }
              
              console.log('Adding new chat to list:', completeChat.id);
              return [completeChat, ...currentChats];
            });
          }
        }, 100);
        
        // Return current chats unchanged for now
        return prevChats;
      }
    });
  };

  // Polling function as fallback when WebSocket fails
  const startPolling = () => {
    console.log('Starting polling for real-time updates...');
    
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    pollingInterval.current = setInterval(async () => {
      if (!user) return;
      
      try {
        // Check for new messages since last poll
        const { data: newMessages } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(*)
          `)
          .gt('created_at', lastMessageTimestamp.current || new Date(0).toISOString())
          .order('created_at', { ascending: true }) // Changed to ascending to process in order
          .limit(50);
        
        if (newMessages && newMessages.length > 0) {
          console.log('Polling found new messages:', newMessages.length);
          
          // Process each message
          for (const message of newMessages) {
            // Check if we're a member of this chat
            const { data: membership } = await supabase
              .from('chat_members')
              .select('*')
              .eq('chat_id', message.chat_id)
              .eq('user_id', user.id)
              .single();
            
            if (membership) {
              console.log('Processing message for chat:', message.chat_id);
              await updateChatWithNewMessage(message);
              
              // If this is the active chat, update messages
              if (activeChat && message.chat_id === activeChat.id && message.sender_id !== user.id) {
                setMessages(prev => {
                  // Check if message already exists
                  if (prev.some(m => m.id === message.id)) {
                    return prev;
                  }
                  return [...prev, message];
                });
                
                // Mark message as delivered if not from current user
                await supabase
                  .from('messages')
                  .update({ delivered: true })
                  .eq('id', message.id);
              }
            }
          }
          
          // Update timestamp to the latest message
          lastMessageTimestamp.current = newMessages[newMessages.length - 1].created_at;
        }
        
        // Check for new chat memberships (less frequently)
        if (Date.now() % 5 === 0) { // Every 5th poll (15 seconds)
          const { data: newMemberships } = await supabase
            .from('chat_members')
            .select('*')
            .eq('user_id', user.id)
            .gt('created_at', lastChatUpdate.current || new Date(0).toISOString());
          
          if (newMemberships && newMemberships.length > 0) {
            console.log('Polling found new chat memberships:', newMemberships.length);
            await refreshChats();
          }
        }
        
      } catch (error) {
        console.log('Polling error (non-critical):', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Setup real-time subscriptions with fallback to polling
  const setupRealtime = async () => {
    if (!user) return;
    
    console.log('Setting up real-time functionality...');
    
    try {
      // Try to set up WebSocket subscriptions
      const messagesChannel = supabase
        .channel('global-messages')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages' }, 
          async (payload) => {
            console.log('Real-time: New message received:', payload);
            const newMessage = payload.new as Message;
            
            // Check if we're a member of this chat
            const { data: membership } = await supabase
              .from('chat_members')
              .select('*')
              .eq('chat_id', newMessage.chat_id)
              .eq('user_id', user.id)
              .single();
            
            if (membership) {
              console.log('Real-time: Message affects our chats, updating...');
              
              // Fetch sender details
              const { data: sender } = await supabase
                .from('users')
                .select('*')
                .eq('id', newMessage.sender_id)
                .single();
                
              const messageWithSender = {
                ...newMessage,
                sender
              };
              
              await updateChatWithNewMessage(messageWithSender);
              
              // If this is the active chat and not from current user, update messages
              if (activeChat && newMessage.chat_id === activeChat.id && newMessage.sender_id !== user.id) {
                setMessages(prev => {
                  // Check if message already exists
                  if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                  }
                  return [...prev, messageWithSender];
                });
                
                // Mark message as delivered
                await supabase
                  .from('messages')
                  .update({ delivered: true })
                  .eq('id', newMessage.id);
              }
              
              // Update timestamp
              lastMessageTimestamp.current = newMessage.created_at;
            }
          }
        )
        .subscribe((status) => {
          console.log('Messages subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Real-time WebSocket connected successfully!');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.log('WebSocket failed, falling back to polling...');
            startPolling();
          }
        });
        
      const membersChannel = supabase
        .channel('global-chat-members')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'chat_members' }, 
          async (payload) => {
            console.log('Real-time: New chat member added:', payload);
            const newMember = payload.new;
            
            if (newMember.user_id === user.id) {
              console.log('Real-time: Current user was added to a new chat, refreshing...');
              await refreshChats();
            }
          }
        )
        .subscribe((status) => {
          console.log('Chat members subscription status:', status);
        });
      
      subscriptions.current = [messagesChannel, membersChannel];
      
      // Start polling as backup after 10 seconds if WebSocket hasn't connected
      setTimeout(() => {
        if (messagesChannel.state !== 'joined') {
          console.log('WebSocket not connected after 10s, starting polling backup...');
          startPolling();
        }
      }, 10000);
      
    } catch (error) {
      console.log('Failed to set up WebSocket, using polling only:', error);
      startPolling();
    }
  };

  // Filtered chats based on search term and active labels
  const filteredChats = chats.filter((chat) => {
    if (!chat) return false;
    
    // For direct chats, search by other user's name/email
    let nameMatch = false;
    if (chat.is_group) {
      nameMatch = chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    } else {
      // For direct chats, find the other user
      const otherMember = chat.members?.find(member => member.user_id !== user?.id);
      if (otherMember?.user) {
        const otherUserName = otherMember.user.name?.toLowerCase() || '';
        const otherUserEmail = ((otherMember.user as any).email)?.toLowerCase() || '';
        nameMatch = otherUserName.includes(searchTerm.toLowerCase()) || 
                   otherUserEmail.includes(searchTerm.toLowerCase());
      }
    }
    
    // If no search term, show all
    if (!searchTerm) {
      nameMatch = true;
    }
    
    // If no active labels, show all matching name
    if (activeLabels.length === 0) {
      return nameMatch;
    }
    
    // Filter by both name and active labels
    const labelsMatch = chat.labels?.some((chatLabel) => 
      activeLabels.includes(chatLabel.label_id)
    ) || false;
    
    return nameMatch && labelsMatch;
  });

  // Toggle a label in the filter
  const toggleLabel = (labelId: string) => {
    setActiveLabels((prev) => {
      if (prev.includes(labelId)) {
        return prev.filter((id) => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };

  // Fetch chats from Supabase
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchChats = async () => {
      setIsLoading(true);
      
      try {
        console.log('Fetching chats for user:', user.id);
        
        // First, ensure user exists in the database
        const { data: userCheck, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!userCheck && !userError) {
          console.log('User not found in database, creating user record');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
            })
            .select()
            .single();
            
          if (insertError) {
            logError('Error creating user', insertError);
          } else {
            console.log('User created successfully:', newUser);
          }
        } else if (userError) {
          logError('Error checking user', userError);
        } else {
          console.log('User found in database:', userCheck);
        }
        
        // Fetch chat members
        const { data: chatMembers, error: memberError } = await supabase
          .from('chat_members')
          .select('*')
          .eq('user_id', user.id);
          
        if (memberError) {
          logError('Error fetching chat members', memberError);
          setChats([]);
          return;
        }
        
        console.log('Chat members found:', chatMembers?.length || 0);
        
        if (chatMembers && chatMembers.length > 0) {
          const chatIds = chatMembers.map((member) => member.chat_id);
          
          // Fetch all chats with complete data
          const processedChats = await Promise.all(
            chatIds.map(async (chatId) => {
              return await fetchCompleteChat(chatId);
            })
          );
          
          // Filter out null results and sort by updated_at
          const validChats = processedChats
            .filter(chat => chat !== null)
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          
          setChats(validChats);
          console.log('Chats fetched:', validChats.length);
          
          // Set initial timestamps for polling
          if (validChats.length > 0) {
            lastChatUpdate.current = new Date().toISOString();
            
            // Find the most recent message timestamp
            const allMessages = validChats
              .map(chat => chat.last_message)
              .filter(Boolean)
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              
            if (allMessages.length > 0) {
              lastMessageTimestamp.current = (allMessages[0] as any).created_at;
            }
          }
          
          // Sync with IndexedDB
          try {
            await syncChats(validChats);
          } catch (syncError) {
            console.log('IndexedDB sync failed, continuing without cache');
          }
        } else {
          console.log('No chats found for user');
          setChats([]);
        }
      } catch (error) {
        logError('Error in fetchChats', error);
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchLabels = async () => {
      try {
        const { data: fetchedLabels, error } = await supabase
          .from('labels')
          .select('*');
          
        if (error) {
          logError('Error fetching labels', error);
          return;
        }
        
        setLabels(fetchedLabels || []);
      } catch (error) {
        logError('Error in fetchLabels', error);
      }
    };

    fetchChats();
    fetchLabels();
  }, [user, supabase]);

  // Set up real-time functionality
  useEffect(() => {
    if (!user || chats.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      setupRealtime();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      
      // Clean up subscriptions
      subscriptions.current.forEach(subscription => {
        try {
          supabase.removeChannel(subscription);
        } catch (error) {
          console.log('Error cleaning up subscription:', error);
        }
      });
      
      // Clean up polling
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [user, supabase, activeChat, chats]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for chat:', activeChat.id);
        
        const { data: fetchedMessages, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users(*)
          `)
          .eq('chat_id', activeChat.id)
          .order('created_at', { ascending: true });
          
        if (error) {
          logError('Error fetching messages', error);
          return;
        }
        
        console.log('Messages fetched:', fetchedMessages?.length || 0);
        setMessages(fetchedMessages || []);
        
        // Mark messages as delivered
        if (fetchedMessages && fetchedMessages.some(msg => msg.sender_id !== user.id && !msg.delivered)) {
          const messagesToUpdate = fetchedMessages
            .filter(msg => msg.sender_id !== user.id && !msg.delivered)
            .map(msg => msg.id);
            
          if (messagesToUpdate.length > 0) {
            await supabase
              .from('messages')
              .update({ delivered: true })
              .in('id', messagesToUpdate);
          }
        }
      } catch (error) {
        logError('Error in fetchMessages', error);
      }
    };

    fetchMessages();
  }, [activeChat, user, supabase]);

  // Send a message
  const sendMessage = async (content: string, attachment?: File) => {
    if (!user || !activeChat) return;
    
    let attachmentUrl = '';
    
    if (attachment) {
      try {
        attachmentUrl = await uploadAttachment(attachment);
      } catch (error) {
        logError('Error uploading attachment', error);
        return;
      }
    }
    
    const newMessage = {
      chat_id: activeChat.id,
      sender_id: user.id,
      content,
      attachment_url: attachmentUrl || null,
      delivered: false,
      read: false,
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select('*, sender:users(*)')
      .single();
      
    if (error) {
      logError('Error sending message', error);
      return;
    }
    
    console.log('Message sent successfully:', data);
    
    // Update local state immediately for sender
    setMessages((prevMessages) => [...prevMessages, data]);
    
    // Update local chat list order immediately for sender
    setChats((prevChats) => {
      const chatIndex = prevChats.findIndex((c) => c.id === activeChat.id);
      
      if (chatIndex !== -1) {
        const updatedChat = {
          ...prevChats[chatIndex],
          last_message: data,
          updated_at: data.created_at,
        };
        
        const updatedChats = [...prevChats];
        updatedChats.splice(chatIndex, 1);
        return [updatedChat, ...updatedChats];
      }
      
      return prevChats;
    });
    
    // Update timestamp for polling
    lastMessageTimestamp.current = data.created_at;
  };

  // Upload attachment
  const uploadAttachment = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) {
      logError('Error uploading attachment', error);
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(data.path);
      
    return urlData.publicUrl;
  };

  const value = {
    chats,
    activeChat,
    setActiveChat,
    messages,
    sendMessage,
    isLoading,
    searchTerm,
    setSearchTerm,
    filteredChats,
    activeLabels,
    toggleLabel,
    labels,
    uploadAttachment,
    refreshChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}