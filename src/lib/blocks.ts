import { supabase } from './supabase';

/**
 * Block a user
 */
export async function blockUser(
  blockerId: string,
  blockedId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('[Blocks] Error blocking user:', error);
    throw error;
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  } catch (error) {
    console.error('[Blocks] Error unblocking user:', error);
    throw error;
  }
}

/**
 * Check if a user is blocked
 */
export async function isUserBlocked(
  blockerId: string,
  blockedId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected when not blocked
      console.error('[Blocks] Error checking block status:', error);
    }

    return !!data;
  } catch (error) {
    console.error('[Blocks] Error checking block status:', error);
    return false;
  }
}

/**
 * Get list of blocked users by current user
 */
export async function getBlockedUsers(blockerId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        blocked_id,
        created_at,
        blocked_user:blocked_id(id, username, email, avatar_url, bio)
      `)
      .eq('blocker_id', blockerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Blocks] Error fetching blocked users:', error);
    throw error;
  }
}

/**
 * Get list of user IDs that the current user has blocked
 * (Optimized for filtering queries)
 */
export async function getBlockedUserIds(blockerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', blockerId);

    if (error) throw error;

    return (data || []).map(row => row.blocked_id);
  } catch (error) {
    console.error('[Blocks] Error fetching blocked user IDs:', error);
    return [];
  }
}

/**
 * Get list of user IDs that have blocked the current user
 * (Used to hide current user's content from blockers)
 */
export async function getUsersWhoBlockedMe(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('blocker_id')
      .eq('blocked_id', userId);

    if (error) throw error;

    return (data || []).map(row => row.blocker_id);
  } catch (error) {
    console.error('[Blocks] Error fetching users who blocked me:', error);
    return [];
  }
}

/**
 * Check if there's a block relationship between two users (either direction)
 */
export async function checkBlockRelationship(
  userId1: string,
  userId2: string
): Promise<{ user1BlockedUser2: boolean; user2BlockedUser1: boolean }> {
  try {
    // Check if user1 blocked user2
    const { data: block1 } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', userId1)
      .eq('blocked_id', userId2)
      .single();

    // Check if user2 blocked user1
    const { data: block2 } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', userId2)
      .eq('blocked_id', userId1)
      .single();

    return {
      user1BlockedUser2: !!block1,
      user2BlockedUser1: !!block2,
    };
  } catch (error) {
    console.error('[Blocks] Error checking block relationship:', error);
    return {
      user1BlockedUser2: false,
      user2BlockedUser1: false,
    };
  }
}
