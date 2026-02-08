import { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing } from '@/lib/follows';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

export function FollowListModal({ isOpen, onClose, userId, type, title }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (type === 'followers') {
        const data = await getFollowers(userId);
        setUsers(data);
      } else {
        const data = await getFollowing(userId);
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    setLoading(false);
  };

  const getDisplayName = (user: any) => {
    if (!user) return 'Unknown';
    if (user.username) {
      if (user.username.includes('@')) {
        return user.username.split('@')[0];
      }
      return user.username;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Unknown';
  };

  const handleUserClick = (targetUserId: string) => {
    onClose();
    navigate(`/user/${targetUserId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md max-h-[70vh] rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="w-6" />
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-[calc(70vh-56px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <User className="w-12 h-12 mb-2" />
              <p className="text-sm">No {type} yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {users.map((item) => {
                const user = type === 'followers' ? item.follower : item.following;
                const targetUserId = type === 'followers' ? item.follower_id : item.following_id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleUserClick(targetUserId)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={getDisplayName(user)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{getDisplayName(user)}</p>
                      {user?.bio && (
                        <p className="text-xs text-gray-500 truncate">{user.bio}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
