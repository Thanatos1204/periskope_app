import { createClient as createServerSupabaseClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// Utility function to get Supabase client with cookie persistence

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: chatMembers, error: chatMembersError } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId);

    if (chatMembersError) throw chatMembersError;

    const memberIds = chatMembers.map((member) => member.user_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, updated_at')
      .in('id', memberIds);

    if (usersError) throw usersError;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const onlineStatus = users.map((user) => ({
      id: user.id,
      name: user.name,
      online: new Date(user.updated_at) > new Date(fiveMinutesAgo),
      last_seen: user.updated_at,
    }));

    return NextResponse.json({ users: onlineStatus });
  } catch (error) {
    console.error('Error fetching presence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presence data' },
      { status: 500 }
    );
  }
}
