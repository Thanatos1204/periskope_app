import { useEffect, useState } from 'react';
import { supabase } from './supabase';

interface PresenceUser {
  id: string;
  name: string;
  online: boolean;
  last_seen: string;
}

export function usePresence(chatId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Update current user's presence
  useEffect(() => {
    const updatePresence = async () => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Update immediately
    updatePresence();

    // Then update every minute
    const interval = setInterval(updatePresence, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get online users for the selected chat
  useEffect(() => {
    if (!chatId) {
      setOnlineUsers([]);
      setLoading(false);
      return;
    }

    const fetchOnlineUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/presence?chatId=${chatId}`);
        const data = await response.json();
        
        if (data.users) {
          setOnlineUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchOnlineUsers();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);

    // Set up real-time subscription
    const presenceChannel = supabase
      .channel(`presence-${chatId}`)
      .on('presence', { event: 'sync' }, () => {
        fetchOnlineUsers();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(presenceChannel);
    };
  }, [chatId]);

  return { onlineUsers, loading };
}