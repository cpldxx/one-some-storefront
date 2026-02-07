import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { togglePostLike } from '@/lib/community';
import { Heart, MessageCircle, ArrowLeft, Send } from 'lucide-react';

// Helper function to get display name
const getDisplayName = (profile: any): string => {
  if (!profile) return 'Anonymous';
  
  // Check username first
  if (profile.username) {
    // If username looks like an email, extract the part before @
    if (profile.username.includes('@')) {
      return profile.username.split('@')[0];
    }
    return profile.username;
  }
  
  // Fallback to email
  if (profile.email) {
    return profile.email.split('@')[0];
  }
  
  return 'Anonymous';
};

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profiles?: {
    username: string;
    email?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  tags: {
    season: string[];
    style: string[];
    brand: string[];
    category: string[];
  };
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles?: {
    username: string;
    email?: string;
    avatar_url?: string;
  };
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Go back handler - invalidate cache if changes exist
  const handleGoBack = () => {
    if (hasChanges) {
      queryClient.invalidateQueries({ queryKey: ['style-posts'] });
    }
    navigate(-1);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, email, avatar_url)')
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('Error fetching post:', error);
      navigate('/community');
      return;
    }
    
    const postData = data as Post;
    setPost(postData);
    setLikeCount(postData.like_count || 0);
    
    // Check if current user liked this post
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      setLiked(!!existingLike);
    }
    
    setLoading(false);
  };

  const fetchComments = async () => {
    if (!postId) return;
    const { data, error } = await (supabase
      .from('comments')
      .select('*, profiles(username, email, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }) as any);

    if (!error && data) {
      // Organize comments into threads (parent comments with replies)
      const parentComments: Comment[] = [];
      const repliesMap: Map<string, Comment[]> = new Map();
      
      data.forEach((c: Comment) => {
        if (c.parent_id) {
          // This is a reply
          const existing = repliesMap.get(c.parent_id) || [];
          existing.push(c);
          repliesMap.set(c.parent_id, existing);
        } else {
          // This is a parent comment
          parentComments.push(c);
        }
      });
      
      // Attach replies to parent comments
      const threaded = parentComments.map(parent => ({
        ...parent,
        replies: repliesMap.get(parent.id) || []
      }));
      
      // Sort: newest first
      threaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setComments(threaded);
      
      // DB의 comment_count와 실제 댓글 수가 다르면 동기화
      if (post && post.comment_count !== data.length) {
        await (supabase.from('posts') as any)
          .update({ comment_count: data.length })
          .eq('id', postId);
        setPost({ ...post, comment_count: data.length });
      }
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to like!');
      navigate('/login');
      return;
    }
    
    setIsLiking(true);
    
    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLiked(newLiked);
    setLikeCount(newCount);
    if (post) {
      setPost({ ...post, like_count: newCount });
    }
    
    // Update React Query cache
    queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any[]) =>
          page.map((p: any) =>
            p.id === postId
              ? { ...p, is_liked: newLiked, like_count: newCount }
              : p
          )
        ),
      };
    });
    
    try {
      const result = await togglePostLike(postId!, user.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
      if (post) {
        setPost({ ...post, like_count: result.likeCount });
      }
      
      // Update cache with actual DB values
      queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((p: any) =>
              p.id === postId
                ? { ...p, is_liked: result.liked, like_count: result.likeCount }
                : p
            )
          ),
        };
      });
      
      setHasChanges(true);
    } catch (error) {
      // Rollback
      setLiked(liked);
      setLikeCount(likeCount);
      console.error('Like failed:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to comment!');
      navigate('/login');
      return;
    }

    // Get user profile
    const { data: userProfile } = await (supabase
      .from('profiles') as any)
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    const commentContent = comment;
    setComment(''); // Clear input first

    // Optimistic update: add to UI immediately
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId!,
      user_id: user.id,
      content: commentContent,
      parent_id: null,
      created_at: new Date().toISOString(),
      profiles: {
        username: userProfile?.username || user.email?.split('@')[0] || 'Me',
        avatar_url: userProfile?.avatar_url || null,
      },
      replies: [],
    };
    setComments(prev => [tempComment, ...prev]);

    // Update comment_count locally
    const newCommentCount = (post?.comment_count || 0) + 1;
    if (post) {
      setPost({ ...post, comment_count: newCommentCount });
    }

    // Save to DB
    const { data: insertedComment, error } = await (supabase
      .from('comments') as any)
      .insert({
        post_id: postId,
        user_id: user.id,
        content: commentContent,
      })
      .select('*, profiles(username, avatar_url)')
      .single();

    if (error) {
      console.error('Failed to post comment:', error);
      // Rollback on failure
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      const rollbackCount = (post?.comment_count || 1);
      if (post) {
        setPost({ ...post, comment_count: rollbackCount });
      }
      alert('Failed to post comment: ' + error.message);
      return;
    }

    // Replace temporary comment with actual comment
    if (insertedComment) {
      setComments(prev => prev.map(c => 
        c.id === tempComment.id ? insertedComment : c
      ));
    }

    // Update comment_count in DB
    await (supabase.from('posts') as any)
      .update({ comment_count: newCommentCount })
      .eq('id', postId);
    
    // Update React Query cache immediately
    queryClient.setQueriesData({ queryKey: ['style-posts'] }, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any[]) =>
          page.map((p: any) =>
            p.id === postId
              ? { ...p, comment_count: newCommentCount }
              : p
          )
        ),
      };
    });
    
    // Mark changes - for cache invalidation on back navigation
    setHasChanges(true);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!post) return <div className="p-10 text-center">Post not found.</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 h-14 flex items-center">
        <button onClick={handleGoBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold ml-2">Post</span>
      </header>

      <div className="max-w-md mx-auto">
        <div className="w-full bg-gray-100">
          <img src={encodeURI(post.image_url)} alt="Post" className="w-full h-auto object-contain max-h-[600px]" />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
               {post.profiles?.avatar_url && <img src={post.profiles.avatar_url} className="w-full h-full object-cover" />}
            </div>
            <div>
              <p className="font-bold text-sm">{getDisplayName(post.profiles)}</p>
              <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed">{post.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-6">
            {[...(post.tags?.season||[]), ...(post.tags?.style||[]), ...(post.tags?.brand||[])].map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">#{tag}</span>
            ))}
          </div>

          <div className="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-6">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} /> 
              {likeCount}
            </button>
            <div className="flex items-center gap-1"><MessageCircle className="w-5 h-5" /> {comments.length}</div>
          </div>

          <div className="space-y-4 mb-20">
            <h3 className="font-bold text-sm">Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>
            {comments.map((c) => (
              <div key={c.id} className="pb-4">
                {/* Parent Comment */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    {c.profiles?.avatar_url && <img src={c.profiles.avatar_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{getDisplayName(c.profiles)}</span>{' '}
                      <span className="text-gray-800">{c.content}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      <button 
                        onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                        className="font-semibold hover:text-gray-700"
                      >
                        Reply
                      </button>
                    </div>
                    
                    {/* Reply Input - Instagram style */}
                    {replyingTo === c.id && (
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                          if (!input.value.trim()) return;
                          
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) {
                            alert('Please login to reply!');
                            navigate('/login');
                            return;
                          }
                          
                          const replyContent = input.value;
                          input.value = '';
                          
                          const { error } = await (supabase.from('comments') as any)
                            .insert({
                              post_id: postId,
                              user_id: user.id,
                              content: replyContent,
                              parent_id: c.id,
                            });
                          
                          if (error) {
                            alert('Failed to post reply');
                            return;
                          }
                          
                          setReplyingTo(null);
                          fetchComments();
                          setHasChanges(true);
                        }}
                        className="flex gap-2 mt-3"
                      >
                        <input
                          type="text"
                          placeholder={`Reply to ${getDisplayName(c.profiles)}...`}
                          className="flex-1 border-b border-gray-300 py-1 text-sm outline-none focus:border-gray-500"
                          autoFocus
                        />
                        <button type="submit" className="text-sm text-blue-500 font-semibold">
                          Post
                        </button>
                      </form>
                    )}
                    
                    {/* Replies - Instagram style (always visible, indented) */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {!expandedReplies.has(c.id) && c.replies.length > 2 ? (
                          <>
                            {/* Show "View all X replies" if more than 2 */}
                            <button 
                              onClick={() => toggleReplies(c.id)}
                              className="text-xs text-gray-500 font-semibold flex items-center gap-2"
                            >
                              <span className="w-6 h-px bg-gray-300"></span>
                              View all {c.replies.length} replies
                            </button>
                            {/* Show last 2 replies */}
                            {c.replies.slice(-2).map((reply) => (
                              <div key={reply.id} className="flex gap-3 ml-0">
                                <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                  {reply.profiles?.avatar_url && <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">
                                    <span className="font-semibold">{getDisplayName(reply.profiles)}</span>{' '}
                                    <span className="text-gray-800">{reply.content}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            {/* Show all replies or collapse button */}
                            {expandedReplies.has(c.id) && c.replies.length > 2 && (
                              <button 
                                onClick={() => toggleReplies(c.id)}
                                className="text-xs text-gray-500 font-semibold flex items-center gap-2"
                              >
                                <span className="w-6 h-px bg-gray-300"></span>
                                Hide replies
                              </button>
                            )}
                            {c.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3 ml-0">
                                <div className="w-6 h-6 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                  {reply.profiles?.avatar_url && <img src={reply.profiles.avatar_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm">
                                    <span className="font-semibold">{getDisplayName(reply.profiles)}</span>{' '}
                                    <span className="text-gray-800">{reply.content}</span>
                                  </p>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 pb-safe">
        <form onSubmit={handleAddComment} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5"
          />
          <button type="submit" disabled={!comment.trim()} className="p-2.5 bg-black text-white rounded-full disabled:opacity-50 disabled:bg-gray-300">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
