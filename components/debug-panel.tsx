'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useChat } from '@/lib/chat-context';
import { createClient } from '@/utils/supabase/client';

export default function DebugPanel() {
  const { user } = useAuth();
  const { chats, labels } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const supabase = createClient();

  const createTestData = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage('Creating test data...');
    
    try {
      // Ensure current user exists in users table
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
        });
        
      if (userError) {
        console.error('Error creating user:', userError);
        setMessage('Error creating user record');
        return;
      }
      
      // Create a test chat with ourselves (for testing)
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          name: 'Test Chat',
          is_group: false
        })
        .select()
        .single();
        
      if (chatError) {
        console.error('Error creating chat:', chatError);
        setMessage('Error creating chat');
        return;
      }
      
      // Add current user to the chat
      const { error: memberError } = await supabase
        .from('chat_members')
        .insert({
          chat_id: chatData.id,
          user_id: user.id
        });
        
      if (memberError) {
        console.error('Error adding chat member:', memberError);
        setMessage('Error adding chat member');
        return;
      }
      
      // Add a test message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatData.id,
          sender_id: user.id,
          content: 'Hello! This is a test message created from the debug panel.'
        });
        
      if (messageError) {
        console.error('Error creating message:', messageError);
        setMessage('Error creating message');
        return;
      }
      
      // Add a label to the chat
      const demoLabel = labels.find(l => l.name === 'Demo');
      if (demoLabel) {
        await supabase
          .from('chat_labels')
          .insert({
            chat_id: chatData.id,
            label_id: demoLabel.id
          });
      }
      
      setMessage('Test data created successfully! Refresh the page to see the new chat.');
    } catch (error) {
      console.error('Error creating test data:', error);
      setMessage('Error creating test data');
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          <h3 className="font-semibold text-gray-900 mb-3">Debug Panel</h3>
          
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Chats:</strong> {chats.length}</div>
            <div><strong>Labels:</strong> {labels.length}</div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={createTestData}
              disabled={loading || !user}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Data'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white px-3 py-2 rounded-md text-sm"
            >
              Refresh Page
            </button>
          </div>
          
          {message && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}