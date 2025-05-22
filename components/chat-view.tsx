'use client';

import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiPaperclip, FiSend, FiSmile } from 'react-icons/fi';
import Avatar from './avatar';
import MessageBubble from './message-bubble';
import EmptyChatView from './empty-chat-view';

export default function ChatView() {
  const { activeChat, messages, sendMessage, isLoading } = useChat();
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate chat display name
  const getChatDisplayName = () => {
    if (!activeChat) return 'Chat';
    
    if (activeChat.is_group) {
      return activeChat.name || 'Group Chat';
    } else if (activeChat.members && activeChat.members.length > 0) {
      // Find the other user in the chat
      const otherMember = activeChat.members.find(member => member.user_id !== user?.id);
      if (otherMember?.user) {
        return otherMember.user.name || 'Unknown User';
      }
    }
    return 'Unknown Chat';
  };
  
  const chatDisplayName = getChatDisplayName();
  
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
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate(messages);

  return (
    <section className="flex-1 flex flex-col h-full">
      <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            name={chatDisplayName} 
            size="md" 
          />
          <div>
            <h2 className="font-semibold text-gray-900">{chatDisplayName}</h2>
            <div className="flex items-center gap-1">
              {activeChat.members && (
                <span className="text-xs text-gray-500">
                  {activeChat.members.length} members
                </span>
              )}
              {activeChat.labels && activeChat.labels.length > 0 && (
                <>
                  <span className="text-xs text-gray-400 mx-1">•</span>
                  <div className="flex items-center gap-1">
                    {activeChat.labels.slice(0, 2).map((chatLabel) => (
                      <span 
                        key={chatLabel.id}
                        className="text-xs text-gray-500"
                      >
                        {chatLabel.label?.name}
                      </span>
                    ))}
                    {activeChat.labels.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{activeChat.labels.length - 2}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, groupMessages]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                  {date}
                </div>
              </div>
              
              {groupMessages.map((message) => (
                <MessageBubble 
                  key={message.id}
                  message={message}
                  isSender={message.sender_id === user?.id}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <footer className="px-4 py-3 border-t border-gray-200">
        {attachment && (
          <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <FiPaperclip className="text-gray-500 mr-2" size={16} />
              <span className="text-sm text-gray-700 truncate max-w-xs">
                {attachment.name}
              </span>
            </div>
            <button 
              onClick={handleRemoveAttachment}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        )}
        
        {attachmentPreview && (
          <div className="mb-2">
            <img 
              src={attachmentPreview} 
              alt="Preview" 
              className="max-h-32 rounded-md" 
            />
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleAttachmentClick}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FiPaperclip size={20} />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden" 
          />
          
          <button 
            type="button"
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <FiSmile size={20} />
          </button>
          
          <input
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            onChange={handleMessageChange}
            className="flex-1 py-2 px-4 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          
          <button 
            type="submit"
            disabled={!newMessage.trim() && !attachment}
            className="p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend size={20} />
          </button>
        </form>
      </footer>
    </section>
  );
}