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
    season?: string[];
    style?: string[];
    brand?: string[];
    category?: string[];
    gender?: string[];
  },
  sortBy: 'popular' | 'latest' = 'latest'
): Promise<StylePost[]> {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Only fetch likes if user is authenticated
    const selectQuery = user
      ? `
        *,
        profile:user_id(id, email, username, avatar_url, bio),
        likes(user_id)
      `
      : `
        *,
        profile:user_id(id, email, username, avatar_url, bio)
      `;

    let query = supabase
      .from('posts')
      .select(selectQuery);

    // Apply sorting
    if (sortBy === 'popular') {
      query = query.order('like_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply tag filters using JSONB containedBy for each active filter
    // We fetch all posts and filter client-side for complex OR conditions
    // For simple single-value filters, we can use .contains()
    
    const { data, error } = await (query
      .range(page * limit, (page + 1) * limit - 1) as any);

    if (error) {
      // Ignore AbortError (occurs in React Strict Mode)
      if (error.message?.includes('AbortError') || error.code === 'ABORT_ERR') {
        console.log('[Community] Request aborted (expected in dev mode)');
        return [];
      }
      console.error('[Community] Error fetching posts:', error);
      throw error;
    }

    // Transform response data
    let posts: StylePost[] = (data || []).map((post: any) => {
      // Only check likes if user is authenticated and likes data exists
      const hasLikes = user && post.likes && (post.likes || []).length > 0;

      return {
        ...post,
        profile: post.profile,
        is_liked: hasLikes,
      };
    });

    // Client-side filtering (JSONB OR conditions are complex)
    const hasActiveFilters = filters && (
      (filters.season?.length || 0) > 0 ||
      (filters.style?.length || 0) > 0 ||
      (filters.brand?.length || 0) > 0 ||
      (filters.category?.length || 0) > 0 ||
      (filters.gender?.length || 0) > 0
    );

    if (hasActiveFilters) {
      posts = posts.filter((post) => {
        const tags = post.tags || {};
        
        // Pass if at least one matches in each filter category (OR condition)
        // tags is an array, so use some() to check intersection
        const matchesSeason = !filters.season?.length || 
          (tags.season?.some(t => filters.season!.includes(t)) ?? false);
        const matchesStyle = !filters.style?.length || 
          (tags.style?.some(t => filters.style!.includes(t)) ?? false);
        const matchesBrand = !filters.brand?.length || 
          (tags.brand?.some(t => filters.brand!.includes(t)) ?? false);
        const matchesCategory = !filters.category?.length || 
          (tags.category?.some(t => filters.category!.includes(t)) ?? false);
        const matchesGender = !filters.gender?.length || 
          (tags.gender?.some(t => filters.gender!.includes(t)) ?? false);
        
        // Must pass all active filters (AND between categories)
        return matchesSeason && matchesStyle && matchesBrand && matchesCategory && matchesGender;
      });
    }

    return posts;
  } catch (error: any) {
    // Ignore AbortError (occurs in React Strict Mode)
    if (error?.message?.includes('AbortError') || error?.name === 'AbortError') {
      console.log('[Community] Request aborted (expected in dev mode)');
      return [];
    }
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

/**
 * Toggle like on a post
 * Returns: { liked: boolean, likeCount: number }
 */
export async function togglePostLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  try {
    // 1. 기존 좋아요 확인
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    // 현재 포스트의 like_count 가져오기
    const { data: currentPost } = await (supabase
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single() as any);

    const currentLikeCount = (currentPost as any)?.like_count || 0;

    if (existingLike) {
      // 2a. 좋아요 취소 (삭제)
      await (supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId) as any);

      // like_count 감소
      const newCount = Math.max(0, currentLikeCount - 1);
      await (supabase
        .from('posts') as any)
        .update({ like_count: newCount })
        .eq('id', postId);

      return { liked: false, likeCount: newCount };
    } else {
      // 2b. 좋아요 추가
      await (supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId } as any) as any);

      // like_count 증가
      const newCount = currentLikeCount + 1;
      await (supabase
        .from('posts') as any)
        .update({ like_count: newCount })
        .eq('id', postId);

      return { liked: true, likeCount: newCount };
    }
  } catch (error) {
    console.error('[Community] Error toggling like:', error);
    throw error;
  }
}

/**
 * Check if user liked a post
 */
export async function checkUserLiked(
  postId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}
