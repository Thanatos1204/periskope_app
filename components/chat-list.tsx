'use client';

import { useState } from 'react';
import { useChat } from '@/lib/chat-context';
import { 
  FiSearch, 
  FiFilter, 
  FiSave,
  FiCheck,
  FiPlus
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
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: filteredChats.length },
    { id: 'unread', label: 'Unread', count: 2 },
    { id: 'groups', label: 'Groups', count: 5 },
  ];

  return (
    <section className="w-80 border-r border-border flex flex-col h-full bg-background">
      {/* Chat List Header */}
      <div className="chat-list-header">
        {/* Filter Buttons */}
        <div className="chat-filters">
          <button className="filter-button">
            <FiFilter size={12} className="mr-1" />
            Custom filter
          </button>
          <button className="filter-button">
            <FiSave size={12} className="mr-1" />
            Save
          </button>
          <button className="filter-button active">
            <FiCheck size={12} className="mr-1" />
            Filtered
          </button>
          <button className="filter-button" onClick={() => setShowAddModal(true)}>
            <FiPlus size={12} className="mr-1" />
            Add Chat
          </button>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input pl-8"
          />
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeFilterTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-1 text-xs ${
              activeFilterTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}>
              ({tab.count})
            </span>
          </button>
        ))}
      </div>
      
      {/* Label Filters */}
      {showFilters && (
        <ChatFilter 
          labels={labels} 
          activeLabels={activeLabels} 
          toggleLabel={toggleLabel} 
        />
      )}
      
      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSearch size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No chats matching your search' : 'No chats yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a conversation to get started
            </p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add Chat Modal */}
      <AddChatModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </section>
  );
}