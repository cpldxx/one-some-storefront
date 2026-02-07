import { useEffect, useState } from 'react';
import { User, Grid3X3, Heart, Settings, LogOut, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/features/layout/Layout';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  image_url: string;
  like_count: number;
  comment_count: number;
}

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setUser(user);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileData) {
      setProfile(profileData as Profile);
    }
    
    // Fetch my posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, image_url, like_count, comment_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (postsData) {
      setMyPosts(postsData);
    }
    
    // Fetch liked posts
    const { data: likesData } = await (supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id) as any);
    
    if (likesData && likesData.length > 0) {
      const postIds = likesData.map((l: any) => l.post_id);
      const { data: likedPostsData } = await supabase
        .from('posts')
        .select('id, image_url, like_count, comment_count')
        .in('id', postIds)
        .order('created_at', { ascending: false });
      
      if (likedPostsData) {
        setLikedPosts(likedPostsData);
      }
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getDisplayName = () => {
    if (profile?.username) {
      if (profile.username.includes('@')) {
        return profile.username.split('@')[0];
      }
      return profile.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <p className="text-lg mb-4">Please login to view your profile</p>
          <Link to="/login" className="bg-black text-white px-6 py-2 rounded-lg">
            Login
          </Link>
        </div>
      </Layout>
    );
  }

  const currentPosts = activeTab === 'posts' ? myPosts : likedPosts;

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="text-lg font-bold">{getDisplayName()}</h1>
          <div className="flex gap-3">
            <Link to="/settings">
              <Settings className="w-6 h-6" />
            </Link>
            <button onClick={handleLogout}>
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            {/* Stats */}
            <div className="flex-1 flex justify-around">
              <div className="text-center">
                <p className="text-xl font-bold">{myPosts.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{likedPosts.length}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
            </div>
          </div>
          
          {/* Username & Bio */}
          <div className="mt-4">
            <p className="font-bold text-sm">{getDisplayName()}</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          </div>

          {/* Edit Profile Button */}
          <Link 
            to="/settings" 
            className="block w-full mt-4 py-2 text-center text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex justify-center items-center gap-1 border-b-2 transition-colors ${
              activeTab === 'posts' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 flex justify-center items-center gap-1 border-b-2 transition-colors ${
              activeTab === 'likes' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Posts Grid */}
        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {currentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="aspect-square bg-gray-100 relative group"
              >
                <img
                  src={encodeURI(post.image_url)}
                  alt="Post"
                  className="w-full h-full object-cover"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" /> {post.like_count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            {activeTab === 'posts' ? (
              <>
                <Camera className="w-16 h-16 mb-4 stroke-1" />
                <p className="text-lg font-semibold text-black">No Posts Yet</p>
                <p className="text-sm mt-1">Share your first style!</p>
                <Link 
                  to="/community" 
                  className="mt-4 px-6 py-2 bg-black text-white rounded-lg text-sm"
                >
                  Go to Community
                </Link>
              </>
            ) : (
              <>
                <Heart className="w-16 h-16 mb-4 stroke-1" />
                <p className="text-lg font-semibold text-black">No Liked Posts</p>
                <p className="text-sm mt-1">Like posts to save them here</p>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
