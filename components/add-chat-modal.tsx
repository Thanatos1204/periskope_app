'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { createClient } from '@/utils/supabase/client';
import { 
  FiSearch, 
  FiX, 
  FiUser, 
  FiUsers, 
  FiMail,
  FiCheck,
  FiPlus,
  FiLoader
} from 'react-icons/fi';
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg border border-border animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-white">New Conversation</h2>
            <p className="text-sm text-white mt-1">Start a chat with your team members</p>
          </div>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="p-2 rounded-lg text-white hover:bg-muted hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Chat type selector */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setChatType('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                chatType === 'direct'
                  ? 'bg-background text-white shadow-sm border border-border'
                  : 'text-white hover:text-white'
              }`}
            >
              <FiUser size={16} />
              Direct Message
            </button>
            <button
              onClick={() => setChatType('group')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                chatType === 'group'
                  ? 'bg-background text-white shadow-sm border border-border'
                  : 'text-white hover:text-white'
              }`}
            >
              <FiUsers size={16} />
              Group Chat
            </button>
          </div>

          {/* Group name input for group chats */}
          {chatType === 'group' && (
            <div className="space-y-2">
              <label htmlFor="groupName" className="block text-sm font-medium text-white">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-background text-white placeholder:text-white"
              />
            </div>
          )}

          {/* Search input */}
          <div className="space-y-2">
            <label htmlFor="search" className="block text-sm font-medium text-white">
              Search Team Members
            </label>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" size={16} />
              <input
                id="search"
                type="email"
                placeholder="Enter email address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-background text-white placeholder:text-white"
              />
            </div>
            <button
              onClick={searchUsers}
              disabled={loading || !searchTerm.trim()}
              className="w-full bg-muted text-white py-2 px-4 rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Searching...
                </>
              ) : (
                <>
                  <FiSearch size={16} />
                  Search Users
                </>
              )}
            </button>
          </div>

          {/* Selected users for group chat */}
          {chatType === 'group' && selectedUsers.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Selected Members ({selectedUsers.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="flex items-center gap-2 bg-[#3ECF73]/10 text-primary px-3 py-2 rounded-full text-sm font-medium border border-primary/20"
                  >
                    <Avatar name={selectedUser.name} imageUrl={selectedUser.avatar_url} size="xs" />
                    <span>{selectedUser.name}</span>
                    <button
                      onClick={() => toggleUserSelection(selectedUser)}
                      className="hover:bg-[#3ECF73]/20 rounded-full p-1 transition-colors"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiCheck size={12} className="text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-800">Success</h4>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Search Results</p>
              <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className={`p-4 border-b border-border last:border-b-0 hover:bg-muted cursor-pointer transition-colors ${
                      chatType === 'group' && selectedUsers.find(u => u.id === searchUser.id)
                        ? 'bg-[#3ECF73]/5 border-l-2 border-l-primary'
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
                      <Avatar 
                        name={searchUser.name} 
                        imageUrl={searchUser.avatar_url} 
                        size="md"
                        showStatus={true}
                        status="online"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{searchUser.name}</p>
                        <p className="text-sm text-white truncate flex items-center gap-2">
                          <FiMail size={12} />
                          {searchUser.email}
                        </p>
                      </div>
                      {chatType === 'group' && selectedUsers.find(u => u.id === searchUser.id) && (
                        <div className="w-6 h-6 bg-[#3ECF73] rounded-full flex items-center justify-center">
                          <FiCheck size={12} className="text-white" />
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
              className="w-full bg-[#3ECF73] text-white py-3 px-4 rounded-lg hover:bg-[#3ECF73]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Creating Group...
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  Create Group ({selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''})
                </>
              )}
            </button>
          )}

          {/* No results message */}
          {!loading && searchTerm && searchResults.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser size={24} className="text-white" />
              </div>
              <p className="text-white font-medium mb-1">No users found</p>
              <p className="text-sm text-white">
                No users found with email "{searchTerm}"
              </p>
              <p className="text-xs text-white mt-2">
                Make sure the user has an account on the platform
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}