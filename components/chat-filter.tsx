import { Label } from '@/lib/types';
import ChatLabel from './chat-label';
import { FiFilter, FiX } from 'react-icons/fi';

interface ChatFilterProps {
  labels: Label[];
  activeLabels: string[];
  toggleLabel: (labelId: string) => void;
  onClose?: () => void;
}

export default function ChatFilter({ labels, activeLabels, toggleLabel, onClose }: ChatFilterProps) {
  return (
    <div className="px-4 py-4 border-b border-border bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiFilter size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Filter by Labels</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FiX size={14} />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No labels available</p>
        ) : (
          labels.map((label) => (
            <button
              key={label.id}
              onClick={() => toggleLabel(label.id)}
              className={`transition-all duration-200 transform hover:scale-105 ${
                activeLabels.includes(label.id) 
                  ? 'opacity-100 ring-2 ring-primary/50 ring-offset-1 ring-offset-background shadow-sm' 
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <ChatLabel 
                name={label.name} 
                color={label.color || '#888888'} 
                size="sm"
              />
            </button>
          ))
        )}
      </div>
      
      {activeLabels.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {activeLabels.length} label{activeLabels.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={() => activeLabels.forEach(labelId => toggleLabel(labelId))}
              className="text-xs text-primary hover:underline font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}