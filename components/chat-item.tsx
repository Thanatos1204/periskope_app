'use client';

import { useAuth } from '@/lib/auth-context';
import { Chat } from '@/lib/types';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiPhone, FiMoreVertical } from 'react-icons/fi';
import Avatar from './avatar';
import ChatLabel from './chat-label';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  const { user } = useAuth();
  const [chatName, setChatName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lastMessageText, setLastMessageText] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState('');
  const [isUnread, setIsUnread] = useState(false);
  
  useEffect(() => {
    // Determine chat name and phone number
    if (chat.is_group) {
      setChatName(chat.name || 'Group Chat');
      setPhoneNumber('');
    } else if (chat.members && chat.members.length > 0) {
      // Find the other user in the chat
      const otherMember = chat.members.find(member => member.user_id !== user?.id);
      if (otherMember?.user) {
        setChatName(otherMember.user.name || 'Unknown User');
        // Generate a fake phone number for demo purposes
        setPhoneNumber('+91 99779 44008');
      } else {
        setChatName('Unknown User');
        setPhoneNumber('+91 99999 99999');
      }
    } else {
      setChatName('Unknown Chat');
      setPhoneNumber('');
    }
    
    // Set last message and time
    if (chat.last_message) {
      const message = Array.isArray(chat.last_message) 
        ? chat.last_message[0] 
        : chat.last_message;
        
      if (message) {
        setLastMessageText(
          message.attachment_url 
            ? 'Sent an attachment' 
            : message.content || ''
        );
        
        const messageDate = new Date(message.created_at);
        if (isToday(messageDate)) {
          setLastMessageTime(format(messageDate, 'HH:mm'));
        } else if (isYesterday(messageDate)) {
          setLastMessageTime('Yesterday');
        } else {
          setLastMessageTime(format(messageDate, 'dd-MMM-yy'));
        }
        
        // Mock unread status
        setIsUnread(Math.random() > 0.7);
      }
    } else {
      setLastMessageText('');
      setLastMessageTime('');
      setIsUnread(false);
    }
  }, [chat, user]);

  // Mock data for demonstration
  const mockLabels = chat.labels?.slice(0, 2) || [];
  const hasMultipleLabels = (chat.labels?.length || 0) > 2;

  return (
    <article 
      className={`chat-item ${isActive ? 'active' : ''} group`}
      onClick={onClick}
    >
      <div className="chat-item-content">
        {/* Avatar */}
        <div className="chat-item-avatar relative">
          <Avatar name={chatName} size="md" />
          {/* Online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
        </div>
        
        {/* Chat Details */}
        <div className="chat-item-details">
          {/* Header Row */}
          <div className="chat-item-header">
            <div className="flex-1 min-w-0">
              <h3 className="chat-item-name">{chatName}</h3>
              {phoneNumber && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FiPhone size={10} />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="chat-item-time">{lastMessageTime}</span>
              {isUnread && (
                <div className="unread-badge">2</div>
              )}
            </div>
          </div>
          
          {/* Message Preview */}
          {lastMessageText && (
            <div className="flex items-start justify-between mt-1">
              <p className="chat-item-preview flex-1">{lastMessageText}</p>
              <div className="flex items-center gap-1 ml-2">
                {chat.last_message && 
                 !Array.isArray(chat.last_message) && 
                 chat.last_message.sender_id === user?.id && (
                  <FiCheckCircle 
                    size={12} 
                    className={chat.last_message.delivered ? 'text-primary' : 'text-muted-foreground'} 
                  />
                )}
              </div>
            </div>
          )}
          
          {/* Labels and Meta */}
          <div className="chat-item-meta mt-2">
            <div className="flex flex-wrap gap-1">
              {mockLabels.map((chatLabel) => (
                <ChatLabel 
                  key={chatLabel.id} 
                  name={chatLabel.label?.name || ''} 
                  color={chatLabel.label?.color || '#888888'}
                />
              ))}
              {hasMultipleLabels && (
                <span className="text-xs text-muted-foreground">
                  +{(chat.labels?.length || 0) - 2}
                </span>
              )}
            </div>
            
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
              <FiMoreVertical size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}