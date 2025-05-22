interface ChatLabelProps {
  name: string;
  color: string;
}

export default function ChatLabel({ name, color }: ChatLabelProps) {
  // Map label names to predefined CSS classes from globals.css
  const labelClass = {
    'Demo': 'label-demo',
    'Internal': 'label-internal',
    'Content': 'label-content',
    'Signup': 'label-signup',
    'Dont Send': 'label-dontsend',
  }[name] || '';

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${labelClass}`}
      style={!labelClass ? { backgroundColor: color, color: '#fff' } : {}}
    >
      {name}
    </span>
  );
}