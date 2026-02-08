import { supabase } from './supabase';

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('[Follows] Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  } catch (error) {
    console.error('[Follows] Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Check if user is following another user
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Follows] Error checking follow status:', error);
    }

    return !!data;
  } catch (error) {
    console.error('[Follows] Error checking follow status:', error);
    return false;
  }
}

/**
 * Get follower count for a user
 */
export async function getFollowerCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('[Follows] Error getting follower count:', error);
    return 0;
  }
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('[Follows] Error getting following count:', error);
    return 0;
  }
}

/**
 * Get followers list
 */
export async function getFollowers(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        id,
        follower_id,
        created_at,
        follower:follower_id(id, username, email, avatar_url, bio)
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Follows] Error fetching followers:', error);
    return [];
  }
}

/**
 * Get following list
 */
export async function getFollowing(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        id,
        following_id,
        created_at,
        following:following_id(id, username, email, avatar_url, bio)
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Follows] Error fetching following:', error);
    return [];
  }
}
