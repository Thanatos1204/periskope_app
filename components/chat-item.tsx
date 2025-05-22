'use client';

import { useAuth } from '@/lib/auth-context';
import { Chat } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
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
  const [lastMessageText, setLastMessageText] = useState('');
  const [lastMessageTime, setLastMessageTime] = useState('');
  
  useEffect(() => {
    // Determine chat name
    if (chat.is_group) {
      setChatName(chat.name || 'Group Chat');
    } else if (chat.members && chat.members.length > 0) {
      // Find the other user in the chat
      const otherMember = chat.members.find(member => member.user_id !== user?.id);
      if (otherMember?.user) {
        setChatName(otherMember.user.name || 'Unknown User');
      } else {
        setChatName('Unknown User');
      }
    } else {
      setChatName('Unknown Chat');
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
        
        setLastMessageTime(
          formatDistanceToNow(new Date(message.created_at), { addSuffix: true })
        );
      }
    } else {
      setLastMessageText('');
      setLastMessageTime('');
    }
  }, [chat, user]);

  return (
    <article 
      className={`chat-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={chatName} size="sm" />
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{chatName}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              {chat.members && chat.members.length > 0 && (
                <div className="flex -space-x-1">
                  {chat.members.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      name={member.user?.name || ''}
                      size="xs"
                    />
                  ))}
                </div>
              )}
              {chat.members && chat.members.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{chat.members.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">{lastMessageTime}</span>
          <div className="mt-1 flex items-center">
            {chat.last_message && 
             !Array.isArray(chat.last_message) && 
             chat.last_message.sender_id === user?.id && (
              <FiCheckCircle 
                size={12} 
                className={chat.last_message.delivered ? 'text-primary' : 'text-gray-400'} 
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-1 flex items-start justify-between">
        <p className="text-sm text-gray-600 line-clamp-1">{lastMessageText}</p>
      </div>
      
      {chat.labels && chat.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {chat.labels.map((chatLabel) => (
            <ChatLabel 
              key={chatLabel.id} 
              name={chatLabel.label?.name || ''} 
              color={chatLabel.label?.color || '#888888'}
            />
          ))}
        </div>
      )}
    </article>
  );
}