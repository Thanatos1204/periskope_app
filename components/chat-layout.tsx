'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import { initIndexedDB } from '@/lib/indexeddb';
import { 
  FiRefreshCw, 
  FiHelpCircle, 
  FiMoreVertical,
  FiUsers,
  FiPhone
} from 'react-icons/fi';
import Sidebar from './sidebar';
import ChatList from './chat-list';
import ChatView from './chat-view';

export default function ChatLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Initialize IndexedDB
  useEffect(() => {
    const init = async () => {
      try {
        await initIndexedDB();
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
      }
    };

    init();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Top Header */}
        <header className="app-header">
          <div className="flex items-center gap-4">
            <h1 className="header-title">Periskope App</h1>
          </div>
          
          <div className="header-actions">
            <button className="header-button flex items-center gap-2">
              <FiRefreshCw size={14} />
              Refresh
            </button>
            
            <button className="header-button flex items-center gap-2">
              <FiHelpCircle size={14} />
              Help
            </button>
            
            <div className="phone-indicator">
              <FiPhone size={12} />
              <span>5 / 6 phones</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* User avatars */}
              <div className="flex -space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                  +2
                </div>
              </div>
              
              <button className="sidebar-item">
                <FiMoreVertical size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <ChatList />
          <ChatView />
        </div>
      </div>
    </ChatProvider>
  );
}