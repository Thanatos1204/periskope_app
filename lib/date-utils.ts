import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Format a date for chat list items
export function formatChatDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

// Format a date for message groups
export function formatMessageGroupDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, 'MMMM d');
  } else {
    return format(date, 'MMMM d, yyyy');
  }
}

// Format relative time for messages
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Format a timestamp for message bubbles
export function formatMessageTime(dateString: string): string {
  return format(new Date(dateString), 'h:mm a');
}