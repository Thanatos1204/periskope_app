import { Message } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { FiCheckCircle, FiDownload, FiCheck } from 'react-icons/fi';
import Avatar from './avatar';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
}

export default function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const isImage = message.attachment_url?.match(/\.(jpeg|jpg|gif|png)$/i);
  const time = format(new Date(message.created_at), 'HH:mm');
  
  // Determine file type icon and name for non-image attachments
  const getFileInfo = () => {
    if (!message.attachment_url) return null;
    
    const urlParts = message.attachment_url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    return {
      name: fileName,
      ext: fileExt || 'file',
    };
  };
  
  const fileInfo = message.attachment_url ? getFileInfo() : null;

  return (
    <div className={`flex mb-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isSender && (
        <div className="mr-3 self-end mb-1">
          <Avatar 
            name={message.sender?.name || 'User'} 
            imageUrl={message.sender?.avatar_url}
            size="sm" 
          />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isSender ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name for received messages */}
        {!isSender && message.sender?.name && (
          <span className="text-xs text-muted-foreground mb-1 ml-3">
            {message.sender.name}
          </span>
        )}
        
        {/* Message bubble */}
        <div 
          className={`message-bubble relative ${
            isSender ? 'sent' : 'received'
          }`}
        >
          {/* Message text content */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          
          {/* Image attachment */}
          {message.attachment_url && isImage && (
            <div className={`${message.content ? 'mt-2' : ''}`}>
              <img 
                src={message.attachment_url} 
                alt="Attachment" 
                className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment_url, '_blank')}
              />
            </div>
          )}
          
          {/* Non-image attachment */}
          {message.attachment_url && !isImage && fileInfo && (
            <div className={`${message.content ? 'mt-2' : ''}`}>
              <a 
                href={message.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isSender 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30' 
                    : 'bg-white border border-border hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 truncate pr-3">
                  <p className="text-sm font-medium">{fileInfo.name}</p>
                  <p className="text-xs opacity-75">{fileInfo.ext?.toUpperCase()} file</p>
                </div>
                <FiDownload size={16} className="opacity-75" />
              </a>
            </div>
          )}
          
          {/* Message metadata */}
          <div 
            className={`flex items-center gap-1 mt-1 ${
              isSender ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className={`text-xs ${
              isSender ? 'text-white text-opacity-70' : 'text-muted-foreground'
            }`}>
              {time}
            </span>
            
            {/* Read receipts for sent messages */}
            {isSender && (
              <div className="flex">
                <FiCheck 
                  size={14} 
                  className={`${
                    message.delivered 
                      ? 'text-white text-opacity-70' 
                      : 'text-white text-opacity-50'
                  }`} 
                />
                {message.delivered && (
                  <FiCheck 
                    size={14} 
                    className="text-white text-opacity-70 -ml-2" 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}