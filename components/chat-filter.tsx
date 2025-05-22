import { Label } from '@/lib/types';
import ChatLabel from './chat-label';

interface ChatFilterProps {
  labels: Label[];
  activeLabels: string[];
  toggleLabel: (labelId: string) => void;
}

export default function ChatFilter({ labels, activeLabels, toggleLabel }: ChatFilterProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <h3 className="text-xs font-medium text-gray-500 mb-2">Filter by label</h3>
      <div className="flex flex-wrap gap-2">
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => toggleLabel(label.id)}
            className={`transition-all ${
              activeLabels.includes(label.id) ? 'opacity-100 ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <ChatLabel name={label.name} color={label.color || '#888888'} />
          </button>
        ))}
      </div>
    </div>
  );
}