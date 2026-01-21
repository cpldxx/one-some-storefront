/**
 * Supabase Database Types
 * Auto-generated from schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          bio: string | null
          follower_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          description: string
          tags: PostTags
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          description: string
          tags: PostTags
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          description?: string
          tags?: PostTags
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * Post Tags Structure
 * Used in posts.tags JSONB column
 */
export interface PostTags {
  gender?: string[] // ["Male", "Female", "Unisex"]
  season?: string[] // ["Spring", "Summer", "Autumn", "Winter"]
  style?: string[] // ["Minimal", "Street", "Casual", "Amekaji", "Sporty", "Classic", "Grunge"]
  brand?: string[] // ["Nike", "Adidas", "Stussy", "Supreme", "New Balance", "Other"]
  category?: string[] // ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Headwear"]
}

/**
 * Extended Types for Client Use
 */
export type Post = Database['public']['Tables']['posts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export interface StylePost extends Post {
  profile?: Profile;
  is_liked?: boolean;
}

export interface CommentData extends Comment {
  profile?: Profile;
}
