'use client';

import { useState } from 'react';
import { useChat } from '@/lib/chat-context';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiSearch, 
  FiPlus, 
  FiFilter, 
  FiMoreVertical 
} from 'react-icons/fi';
import ChatItem from './chat-item';
import ChatFilter from './chat-filter';
import AddChatModal from './add-chat-modal';

export default function ChatList() {
  const { 
    filteredChats, 
    activeChat, 
    setActiveChat, 
    searchTerm, 
    setSearchTerm, 
    isLoading,
    labels,
    activeLabels,
    toggleLabel
  } = useChat();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <section className="w-72 border-r border-gray-200 flex flex-col h-full">
      <header className="px-4 py-3 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Chats</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full py-2 pl-9 pr-4 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </header>
      
      <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            className={`p-1.5 rounded-md ${showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={toggleFilters}
          >
            <FiFilter size={16} />
          </button>
          <button 
            className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={() => setShowAddModal(true)}
            title="Start new chat"
          >
            <FiPlus size={16} />
          </button>
          <button 
            className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={()=> console.log('Toggle test data: ',filteredChats)}
            title="Toggle Test"
          >
            <FiFilter size={16} />
          </button>

        </div>
        
        <div className="text-xs text-gray-500">
          {filteredChats.length} {filteredChats.length === 1 ? 'chat' : 'chats'}
        </div>
        
        <button className="p-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">
          <FiMoreVertical size={16} />
        </button>
      </div>
      
      {showFilters && (
        <ChatFilter 
          labels={labels} 
          activeLabels={activeLabels} 
          toggleLabel={toggleLabel} 
        />
      )}
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No chats matching your search' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat?.id === chat.id}
              onClick={() => setActiveChat(chat)}
            />
          ))
        )}
        <AddChatModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      </div>
      
    </section>
  );
}