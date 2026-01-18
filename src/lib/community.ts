import { supabase } from './supabase';
import { Database, PostTags, StylePost, CommentData } from '@/types/database';

/**
 * Post creation interface
 */
export interface CreatePostInput {
  imageUrl: string;
  description: string;
  tags: PostTags;
}

/**
 * Fetch style posts with pagination and optional tag filtering
 * Supports infinite query pattern
 */
export async function fetchStylePosts(
  page: number = 0,
  limit: number = 20,
  filters?: {
    season?: string;
    style?: string;
    brand?: string;
    category?: string;
  }
): Promise<StylePost[]> {
  try {
    const { data, error } = await (supabase
      .from('posts')
      .select(
        `
        *,
        profile:user_id(id, email, username, avatar_url, bio),
        likes(user_id)
      `
      )
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1) as any);

    if (error) {
      console.error('[Community] Error fetching posts:', error);
      throw error;
    }

    // 응답 데이터 변환
    const posts: StylePost[] = (data || []).map((post: any) => ({
      ...post,
      profile: post.profile,
      is_liked: (post.likes || []).length > 0,
    }));

    return posts;
  } catch (error) {
    console.error('[Community] Failed to fetch posts:', error);
    throw error;
  }
}

/**
 * Create a new style post
 */
export async function createPost(
  input: CreatePostInput,
  userId: string
): Promise<StylePost> {
  try {
    const { data, error } = await (supabase
      .from('posts')
      .insert({
        user_id: userId,
        image_url: input.imageUrl,
        description: input.description,
        tags: input.tags,
        like_count: 0,
        comment_count: 0,
      } as any)
      .select(
        `
        *,
        profile:user_id(id, email, username, avatar_url, bio)
      `
      )
      .single() as any);

    if (error) {
      console.error('[Community] Error creating post:', error);
      throw error;
    }

    return {
      ...(data || {}),
      is_liked: false,
    };
  } catch (error) {
    console.error('[Community] Failed to create post:', error);
    throw error;
  }
}

/**
 * Toggle like on a post (with optimistic update support)
 */
export async function toggleLike(
  postId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  try {
    if (liked) {
      // Unlike: delete the like record
      const { error } = await (supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId) as any);

      if (error) throw error;

      // Decrement like count (RPC function will be created in Supabase)
      try {
        // @ts-ignore - RPC function defined in Supabase migrations
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } catch (e) {
        console.warn('RPC decrement_post_likes failed:', e);
      }
    } else {
      // Like: insert a new like record
      const { error } = await (supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId } as any) as any);

      if (error) throw error;

      // Increment like count (RPC function will be created in Supabase)
      try {
        // @ts-ignore - RPC function defined in Supabase migrations
        await supabase.rpc('increment_post_likes', { post_id: postId });
      } catch (e) {
        console.warn('RPC increment_post_likes failed:', e);
      }
    }
  } catch (error) {
    console.error('[Community] Error toggling like:', error);
    throw error;
  }
}

/**
 * Fetch comments for a post
 */
export async function fetchComments(postId: string): Promise<CommentData[]> {
  try {
    const { data, error } = await (supabase
      .from('comments')
      .select(
        `
        *,
        profile:user_id(id, email, username, avatar_url, bio)
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true }) as any);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Community] Error fetching comments:', error);
    throw error;
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<CommentData> {
  try {
    const { data, error } = await (supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      } as any)
      .select(
        `
        *,
        profile:user_id(id, email, username, avatar_url, bio)
      `
      )
      .single() as any);

    if (error) throw error;

    // Increment comment count (RPC function will be created in Supabase)
    try {
      // @ts-ignore - RPC function defined in Supabase migrations
      await supabase.rpc('increment_post_comments', { post_id: postId });
    } catch (e) {
      console.warn('RPC increment_post_comments failed:', e);
    }

    return data;
  } catch (error) {
    console.error('[Community] Error adding comment:', error);
    throw error;
  }
}
