'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { createClient } from '@/utils/supabase/client';
import { FiSearch, FiX, FiUser, FiUsers, FiMail } from 'react-icons/fi';
import Avatar from './avatar';

interface AddChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export default function AddChatModal({ isOpen, onClose }: AddChatModalProps) {
  const { user } = useAuth();
  const { setActiveChat, refreshChats } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  
  const supabase = createClient();

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: users, error: searchError } = await supabase
        .from('users')
        .select('id, email, name, avatar_url')
        .ilike('email', `%${searchTerm}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (searchError) {
        throw searchError;
      }

      setSearchResults(users || []);
    } catch (err: any) {
      setError(err.message || 'Error searching users');
    } finally {
      setLoading(false);
    }
  };

  const createDirectChat = async (targetUser: UserSearchResult) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Check if a direct chat already exists between these users
      const { data: existingChats, error: checkError } = await supabase
        .rpc('create_direct_chat', {
          user1_id: user.id,
          user2_id: targetUser.id
        });

      if (checkError) {
        throw checkError;
      }

      // Fetch the created/existing chat with all details
      const { data: chatData, error: fetchError } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members (
            *,
            user:users(*)
          ),
          chat_labels (
            *,
            label:labels(*)
          )
        `)
        .eq('id', existingChats)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const processedChat = {
        ...chatData,
        members: chatData.chat_members,
        labels: chatData.chat_labels,
      };

      // Set this as the active chat
      setActiveChat(processedChat);
      
      // Refresh the chat list to show the new chat
      await refreshChats();
      
      setSuccess(`Chat created with ${targetUser.name}!`);
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error creating chat');
    } finally {
      setLoading(false);
    }
  };

  const createGroupChat = async () => {
    if (!user || selectedUsers.length === 0 || !groupName.trim()) {
      setError('Please enter a group name and select at least one user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberIds = selectedUsers.map(u => u.id);
      
      const { data: groupChatId, error: createError } = await supabase
        .rpc('create_group_chat', {
          chat_name: groupName,
          creator_id: user.id,
          member_ids: memberIds
        });

      if (createError) {
        throw createError;
      }

      // Fetch the created group chat with all details
      const { data: chatData, error: fetchError } = await supabase
        .from('chats')
        .select(`
          *,
          chat_members (
            *,
            user:users(*)
          ),
          chat_labels (
            *,
            label:labels(*)
          )
        `)
        .eq('id', groupChatId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const processedChat = {
        ...chatData,
        members: chatData.chat_members,
        labels: chatData.chat_labels,
      };

      // Set this as the active chat
      setActiveChat(processedChat);
      
      // Refresh the chat list to show the new chat
      await refreshChats();
      
      setSuccess(`Group chat "${groupName}" created!`);
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error creating group chat');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user: UserSearchResult) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const resetModal = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
    setError(null);
    setSuccess(null);
    setChatType('direct');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Chat</h2>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Chat type selector */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChatType('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                chatType === 'direct'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiUser size={16} />
              Direct Chat
            </button>
            <button
              onClick={() => setChatType('group')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                chatType === 'group'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiUsers size={16} />
              Group Chat
            </button>
          </div>

          {/* Group name input for group chats */}
          {chatType === 'group' && (
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          )}

          {/* Search input */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users by Email
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="search"
                type="email"
                placeholder="Enter email address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <button
              onClick={searchUsers}
              disabled={loading || !searchTerm.trim()}
              className="mt-2 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Selected users for group chat */}
          {chatType === 'group' && selectedUsers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Users:</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
                  >
                    <Avatar name={user.name} imageUrl={user.avatar_url} size="xs" />
                    <span>{user.name}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Search Results:</p>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                      chatType === 'group' && selectedUsers.find(u => u.id === searchUser.id)
                        ? 'bg-primary/5'
                        : ''
                    }`}
                    onClick={() => {
                      if (chatType === 'direct') {
                        createDirectChat(searchUser);
                      } else {
                        toggleUserSelection(searchUser);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={searchUser.name} imageUrl={searchUser.avatar_url} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{searchUser.name}</p>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <FiMail size={12} />
                          {searchUser.email}
                        </p>
                      </div>
                      {chatType === 'group' && selectedUsers.find(u => u.id === searchUser.id) && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <FiX size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create group chat button */}
          {chatType === 'group' && (
            <button
              onClick={createGroupChat}
              disabled={loading || !groupName.trim() || selectedUsers.length === 0}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Group...' : `Create Group (${selectedUsers.length} members)`}
            </button>
          )}

          {/* No results message */}
          {!loading && searchTerm && searchResults.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <FiUser size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No users found with email "{searchTerm}"</p>
              <p className="text-sm mt-1">Make sure the user has signed up on the platform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}