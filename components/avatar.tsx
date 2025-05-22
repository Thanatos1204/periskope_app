import Image from 'next/image';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
}

export default function Avatar({ 
  name, 
  imageUrl, 
  size = 'md', 
  className = '',
  showStatus = false,
  status = 'offline'
}: AvatarProps) {
  // Generate initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  // Determine size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  
  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };
  
  // Generate a consistent color based on the name
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
  const bgColor = colors[colorIndex];
  
  // Status indicator colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${
          imageUrl ? 'bg-gray-200' : bgColor
        } overflow-hidden`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 40 : size === 'sm' ? 32 : 24}
            height={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 40 : size === 'sm' ? 32 : 24}
            className="rounded-full object-cover w-full h-full"
          />
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </div>
      
      {/* Status indicator */}
      {showStatus && (
        <div 
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full border-2 border-white ${statusColors[status]}`}
        />
      )}
    </div>
  );
}