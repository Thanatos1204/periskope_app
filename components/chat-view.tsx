'use client';

import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import { 
  FiMoreVertical, 
  FiPaperclip, 
  FiSend, 
  FiSmile,
  FiPhone,
  FiVideo,
  FiInfo,
  FiStar
} from 'react-icons/fi';
import Avatar from './avatar';
import MessageBubble from './message-bubble';
import EmptyChatView from './empty-chat-view';
import ChatLabel from './chat-label';

export default function ChatView() {
  const { activeChat, messages, sendMessage, isLoading } = useChat();
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate chat display name and info
  const getChatDisplayInfo = () => {
    if (!activeChat) return { name: 'Chat', phone: '', memberCount: 0 };
    
    if (activeChat.is_group) {
      return {
        name: activeChat.name || 'Group Chat',
        phone: '',
        memberCount: activeChat.members?.length || 0
      };
    } else if (activeChat.members && activeChat.members.length > 0) {
      const otherMember = activeChat.members.find(member => member.user_id !== user?.id);
      return {
        name: otherMember?.user?.name || 'Unknown User',
        phone: '+91 99779 44008',
        memberCount: activeChat.members.length
      };
    }
    return { name: 'Unknown Chat', phone: '', memberCount: 0 };
  };
  
  const chatInfo = getChatDisplayInfo();
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle message input change
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };
  
  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !attachment) || !activeChat) return;
    
    try {
      await sendMessage(newMessage, attachment || undefined);
      setNewMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle attachment selection
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAttachment(file);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };
  
  // Remove attachment
  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // If no active chat, show empty state
  if (!activeChat) {
    return <EmptyChatView />;
  }
  
  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);

  return (
    <section className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <header className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar 
                name={chatInfo.name} 
                size="lg" 
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-lg text-foreground">{chatInfo.name}</h2>
                {activeChat.labels && activeChat.labels.length > 0 && (
                  <div className="flex items-center gap-1">
                    {activeChat.labels.slice(0, 3).map((chatLabel) => (
                      <ChatLabel 
                        key={chatLabel.id}
                        name={chatLabel.label?.name || ''} 
                        color={chatLabel.label?.color || '#888888'}
                      />
                    ))}
                    {activeChat.labels.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{activeChat.labels.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {chatInfo.phone && (
                  <div className="flex items-center gap-1">
                    <FiPhone size={12} />
                    <span>{chatInfo.phone}</span>
                  </div>
                )}
                {activeChat.is_group && (
                  <span>{chatInfo.memberCount} members</span>
                )}
                <span className="text-green-500">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FiPhone size={20} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FiVideo size={20} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FiStar size={20} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FiInfo size={20} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSmile size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Send a message to {chatInfo.name} to begin your conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, groupMessages]) => (
              <div key={date} className="space-y-4">
                {/* Date Separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-white border border-border shadow-sm text-muted-foreground text-xs px-3 py-1 rounded-full">
                    {date}
                  </div>
                </div>
                
                {/* Messages */}
                <div className="space-y-3">
                  {groupMessages.map((message) => (
                    <MessageBubble 
                      key={message.id}
                      message={message}
                      isSender={message.sender_id === user?.id}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input Area */}
      <footer className="message-input-area">
        {/* Attachment Preview */}
        {attachment && (
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiPaperclip className="text-muted-foreground" size={16} />
              <span className="text-sm text-foreground truncate max-w-xs">
                {attachment.name}
              </span>
            </div>
            <button 
              onClick={handleRemoveAttachment}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>
        )}
        
        {attachmentPreview && (
          <div className="mb-3">
            <img 
              src={attachmentPreview} 
              alt="Preview" 
              className="max-h-32 rounded-lg border border-border" 
            />
          </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage}>
          <div className="message-input">
            <button 
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <FiPaperclip size={18} />
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
            />
            
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={handleMessageChange}
              className="flex-1 px-3 py-2 text-sm border-none outline-none bg-transparent placeholder:text-muted-foreground"
            />
            
            <button 
              type="button"
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <FiSmile size={18} />
            </button>
            
            <button 
              type="submit"
              disabled={!newMessage.trim() && !attachment}
              className="message-send-button"
            >
              <FiSend size={18} />
            </button>
          </div>
        </form>
      </footer>
    </section>
  );
}