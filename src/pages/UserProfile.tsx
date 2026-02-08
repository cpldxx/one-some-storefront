import { useEffect, useState } from 'react';
import { User, Grid3X3, Heart, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/features/layout/Layout';
import { supabase } from '@/lib/supabase';
import { isUserBlocked } from '@/lib/blocks';
import { followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount } from '@/lib/follows';
import { FollowListModal } from '@/components/FollowListModal';

interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
}

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  like_count: number;
  comment_count: number;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // If viewing own profile, redirect to MyPage
    if (user && user.id === userId) {
      navigate('/mypage');
      return;
    }

    // Check block status
    if (user) {
      const blocked = await isUserBlocked(user.id, userId);
      setIsBlocked(blocked);

      const blockedByThem = await isUserBlocked(userId, user.id);
      setIsBlockedByThem(blockedByThem);

      // Check follow status
      const isFollowingUser = await isFollowing(user.id, userId);
      setFollowing(isFollowingUser);
    }

    // Get follower/following counts
    const followers = await getFollowerCount(userId);
    const followings = await getFollowingCount(userId);
    setFollowerCount(followers);
    setFollowingCount(followings);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);
    }

    // Fetch user's posts (only if not blocked)
    if (!isBlockedByThem) {
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, user_id, image_url, like_count, comment_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsData) {
        setUserPosts(postsData);
      }
    }

    setLoading(false);
  };

  const handleToggleFollow = async () => {
    if (!currentUser || !userId) {
      alert('Please login to follow users.');
      navigate('/login');
      return;
    }

    try {
      if (following) {
        await unfollowUser(currentUser.id, userId);
        setFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(currentUser.id, userId);
        setFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Follow/unfollow failed:', error);
      alert('Failed to update follow status.');
    }
  };

  const getDisplayName = () => {
    if (profile?.username) {
      if (profile.username.includes('@')) {
        return profile.username.split('@')[0];
      }
      return profile.username;
    }
    if (profile?.email) {
      return profile.email.split('@')[0];
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

  if (!profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <p className="text-lg mb-4">User not found</p>
          <Link to="/community" className="bg-black text-white px-6 py-2 rounded-lg">
            Go to Community
          </Link>
        </div>
      </Layout>
    );
  }

  // If blocked by them, show limited view
  if (isBlockedByThem) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">{getDisplayName()}</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-20 px-4">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">This content is not available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">{getDisplayName()}</h1>
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
                <p className="text-xl font-bold">{userPosts.length}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <button
                onClick={() => setShowFollowModal('followers')}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-xl font-bold">{followerCount}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </button>
              <button
                onClick={() => setShowFollowModal('following')}
                className="text-center hover:opacity-70 transition-opacity"
              >
                <p className="text-xl font-bold">{followingCount}</p>
                <p className="text-xs text-gray-500">Following</p>
              </button>
            </div>
          </div>

          {/* Username & Bio */}
          <div className="mt-4">
            <p className="font-bold text-sm">{getDisplayName()}</p>
            {profile?.bio && (
              <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
            )}
          </div>

          {/* Follow Button */}
          {currentUser && (
            <button
              onClick={handleToggleFollow}
              className={`w-full mt-4 py-2 text-center text-sm font-semibold rounded-lg transition-colors ${
                following
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <div className="flex-1 py-3 flex justify-center items-center gap-1 border-b-2 border-black text-black">
            <Grid3X3 className="w-5 h-5" />
          </div>
        </div>

        {/* Posts Grid */}
        {userPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-0.5">
            {userPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-100 relative group"
              >
                <Link to={`/community/${post.id}`}>
                  <img
                    src={encodeURI(post.image_url)}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </Link>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm pointer-events-none">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 fill-white" /> {post.like_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Grid3X3 className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-lg font-semibold text-black">No Posts Yet</p>
          </div>
        )}
      </div>

      {/* Follow List Modal */}
      {userId && showFollowModal && (
        <FollowListModal
          isOpen={!!showFollowModal}
          onClose={() => setShowFollowModal(null)}
          userId={userId}
          type={showFollowModal}
          title={showFollowModal === 'followers' ? 'Followers' : 'Following'}
        />
      )}
    </Layout>
  );
}
