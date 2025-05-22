interface ChatLabelProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function ChatLabel({ name, color, size = 'sm' }: ChatLabelProps) {
  // Map label names to predefined CSS classes from globals.css
  const labelClasses = {
    'Demo': 'label-demo',
    'Internal': 'label-internal',
    'Content': 'label-content',
    'Signup': 'label-signup',
    'Dont Send': 'label-dontsend',
    'Private Note': 'label-content', // Use blue for private notes
  };
  
  const labelClass = labelClasses[name as keyof typeof labelClasses] || '';
  
  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
  };

  return (
    <span 
      className={`inline-flex items-center rounded font-medium ${sizeClasses[size]} ${labelClass}`}
      style={!labelClass ? { 
        backgroundColor: color, 
        color: '#fff',
        fontSize: size === 'sm' ? '11px' : '12px'
      } : {}}
    >
      {name}
    </span>
  );
}