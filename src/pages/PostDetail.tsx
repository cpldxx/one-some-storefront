import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, ArrowLeft, Send } from 'lucide-react';

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
    avatar_url?: string;
  };
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false); // 변경사항 추적
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 뒤로가기 핸들러 - 변경사항 있으면 캐시 무효화
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
      .select('*, profiles(username, avatar_url)')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      navigate('/community');
      return;
    }
    setPost(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    if (!postId) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (!error) setComments(data || []);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다!');
      navigate('/login');
      return;
    }

    // 유저 프로필 가져오기
    const { data: userProfile } = await (supabase
      .from('profiles') as any)
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    const commentContent = comment;
    setComment(''); // 입력창 먼저 비우기

    // 낙관적 업데이트: 바로 UI에 추가
    const tempComment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      content: commentContent,
      created_at: new Date().toISOString(),
      profiles: {
        username: userProfile?.username || user.email?.split('@')[0] || '나',
        avatar_url: userProfile?.avatar_url || null,
      },
    };
    setComments(prev => [tempComment, ...prev]);

    // comment_count 바로 업데이트 (로컬)
    const newCommentCount = (post?.comment_count || 0) + 1;
    if (post) {
      setPost({ ...post, comment_count: newCommentCount });
    }

    // DB에 저장
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
            console.error('댓글 작성 실패:', error);
      // 실패 시 롤백
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      const rollbackCount = (post?.comment_count || 1);
      if (post) {
        setPost({ ...post, comment_count: rollbackCount });
      }
      alert('댓글 작성 실패: ' + error.message);
      return;
    }

    // 임시 댓글을 실제 댓글로 교체
    if (insertedComment) {
      setComments(prev => prev.map(c => 
        c.id === tempComment.id ? insertedComment : c
      ));
    }

    // comment_count DB 업데이트
    await (supabase.from('posts') as any)
      .update({ comment_count: newCommentCount })
      .eq('id', postId);
    
    // 변경사항 표시 - 뒤로가기 시 캐시 무효화를 위해
    setHasChanges(true);
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;
  if (!post) return <div className="p-10 text-center">글을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 h-14 flex items-center">
        <button onClick={handleGoBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold ml-2">게시물</span>
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
              <p className="font-bold text-sm">{post.profiles?.username || '익명'}</p>
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
            <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.like_count}</div>
            <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comment_count}</div>
          </div>

          <div className="space-y-4 mb-20">
            <h3 className="font-bold text-sm">댓글 {comments.length}개</h3>
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 text-sm">
                 <div className="font-bold min-w-[3rem] truncate">{c.profiles?.username}</div>
                 <div className="text-gray-700">{c.content}</div>
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
            placeholder="댓글 달기..."
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
