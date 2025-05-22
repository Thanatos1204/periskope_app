import { Message } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import Avatar from './avatar';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
}

export default function MessageBubble({ message, isSender }: MessageBubbleProps) {
  const isImage = message.attachment_url?.match(/\.(jpeg|jpg|gif|png)$/i);
  const time = format(new Date(message.created_at), 'h:mm a');
  
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
    <div className={`flex mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {!isSender && (
        <div className="mr-2 self-end mb-1">
          <Avatar 
            name={message.sender?.name || 'User'} 
            imageUrl={message.sender?.avatar_url}
            size="sm" 
          />
        </div>
      )}
      
      <div className="max-w-[70%]">
        <div 
          className={`message-bubble ${
            isSender ? 'sent' : 'received'
          }`}
        >
          {/* Message text content */}
          {message.content && <p>{message.content}</p>}
          
          {/* Image attachment */}
          {message.attachment_url && isImage && (
            <div className="mt-2">
              <img 
                src={message.attachment_url} 
                alt="Attachment" 
                className="max-w-full rounded-md"
                onClick={() => window.open(message.attachment_url, '_blank')}
              />
            </div>
          )}
          
          {/* Non-image attachment */}
          {message.attachment_url && !isImage && fileInfo && (
            <div className="mt-2">
              <a 
                href={message.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 bg-white bg-opacity-10 rounded-md"
              >
                <div className="flex-1 truncate pr-2">
                  <p className="text-sm font-medium">{fileInfo.name}</p>
                  <p className="text-xs opacity-75">{fileInfo.ext?.toUpperCase()}</p>
                </div>
                <FiDownload size={18} />
              </a>
            </div>
          )}
        </div>
        
        <div 
          className={`flex items-center text-xs text-gray-500 mt-1 ${
            isSender ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{time}</span>
          
          {isSender && (
            <div className="ml-1">
              <FiCheckCircle 
                size={12} 
                className={message.delivered ? 'text-primary' : 'text-gray-400'} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}