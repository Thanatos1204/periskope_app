import Image from 'next/image';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  // Generate initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  // Determine size class
  const sizeClass = {
    xs: 'w-5 h-5 text-[8px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];
  
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

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center text-white ${
        imageUrl ? '' : bgColor
      }`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={size === 'lg' ? 48 : size === 'md' ? 40 : size === 'sm' ? 32 : 20}
          height={size === 'lg' ? 48 : size === 'md' ? 40 : size === 'sm' ? 32 : 20}
          className="rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}