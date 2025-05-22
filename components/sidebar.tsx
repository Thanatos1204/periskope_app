'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { 
  FiHome, 
  FiMessageSquare, 
  FiUsers, 
  FiBarChart, 
  FiSettings, 
  FiLogOut,
  FiHelpCircle,
  FiDatabase,
  FiTrendingUp,
  FiBell,
  FiGrid
} from 'react-icons/fi';

export default function Sidebar() {
  const { signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('chats');

  const navigationItems = [
    { id: 'home', icon: FiHome, label: 'Home' },
    { id: 'chats', icon: FiMessageSquare, label: 'Chats' },
    { id: 'contacts', icon: FiUsers, label: 'Contacts' },
    { id: 'analytics', icon: FiBarChart, label: 'Analytics' },
    { id: 'data', icon: FiDatabase, label: 'Data' },
    { id: 'trends', icon: FiTrendingUp, label: 'Trends' },
    { id: 'notifications', icon: FiBell, label: 'Notifications' },
    { id: 'apps', icon: FiGrid, label: 'Apps' },
  ];

  const bottomItems = [
    { id: 'help', icon: FiHelpCircle, label: 'Help' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar w-14 flex flex-col items-center py-4">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#3ECF73] flex items-center justify-center text-white font-bold text-sm">
          P
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center space-y-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id}
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => setActiveItem(item.id)}
              title={item.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>
      
      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col items-center space-y-3">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id}
              className="sidebar-item"
              onClick={() => {
                if (item.id === 'settings') {
                  setActiveItem(item.id);
                }
              }}
              title={item.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
        
        <button 
          className="sidebar-item"
          onClick={() => signOut()}
          title="Sign Out"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </aside>
  );
}