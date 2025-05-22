import { FiMessageSquare, FiUsers, FiSearch } from 'react-icons/fi';

export default function EmptyChatView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
      {/* Logo and branding */}
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mb-4">
          P
        </div>
        <h2 className="text-2xl font-semibold text-foreground text-center">Periskope Chat</h2>
        <p className="text-muted-foreground text-center mt-1">Professional messaging platform</p>
      </div>
      
      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full mb-8">
        <div className="text-center p-6 bg-white rounded-lg border border-border shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FiMessageSquare size={24} className="text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Start Conversations</h3>
          <p className="text-sm text-muted-foreground">
            Send messages to team members and external contacts
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-border shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FiUsers size={24} className="text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Team Collaboration</h3>
          <p className="text-sm text-muted-foreground">
            Create group chats and manage team communications
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg border border-border shadow-sm">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FiSearch size={24} className="text-primary" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Smart Search</h3>
          <p className="text-sm text-muted-foreground">
            Find messages, files, and contacts instantly
          </p>
        </div>
      </div>
      
      {/* Action prompt */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Select a chat to start messaging
        </h3>
        <p className="text-muted-foreground max-w-md">
          Choose a conversation from the sidebar or create a new chat to begin communicating with your team.
        </p>
      </div>
      
      {/* Quick stats */}
      <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Business messaging platform</span>
        </div>
        <div className="flex items-center gap-2">
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}