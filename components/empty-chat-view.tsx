import { FiMessageSquare } from 'react-icons/fi';

export default function EmptyChatView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
      <div className="p-6 rounded-full bg-gray-100 mb-4">
        <FiMessageSquare size={48} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No chat selected</h2>
      <p className="text-gray-500 text-center max-w-md">
        Select a chat from the list or start a new conversation
      </p>
    </div>
  );
}