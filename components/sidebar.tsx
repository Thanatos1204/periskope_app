'use client';

import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { 
  FiHome, 
  FiMessageSquare, 
  FiUsers, 
  FiPieChart, 
  FiSettings, 
  FiLogOut,
  FiHelpCircle
} from 'react-icons/fi';

export default function Sidebar() {
  const { signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('chats');

  return (
    <aside className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4">
      <div className="mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
          P
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col items-center space-y-4">
        <button 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            activeItem === 'home' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveItem('home')}
        >
          <FiHome size={20} />
        </button>
        
        <button 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            activeItem === 'chats' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveItem('chats')}
        >
          <FiMessageSquare size={20} />
        </button>
        
        <button 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            activeItem === 'contacts' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveItem('contacts')}
        >
          <FiUsers size={20} />
        </button>
        
        <button 
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            activeItem === 'analytics' ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveItem('analytics')}
        >
          <FiPieChart size={20} />
        </button>
      </nav>
      
      <div className="mt-auto flex flex-col items-center space-y-4">
        <button 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
          onClick={() => {}}
        >
          <FiHelpCircle size={20} />
        </button>
        
        <button 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
          onClick={() => {}}
        >
          <FiSettings size={20} />
        </button>
        
        <button 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
          onClick={() => signOut()}
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </aside>
  );
}