import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Ban, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/features/layout/Layout';
import { supabase } from '@/lib/supabase';
import { FILTERS } from '@/constants/filters';
import { getBlockedUsers, unblockUser } from '@/lib/blocks';

interface ProfileData {
  username: string;
  bio: string;
  avatar_url: string;
  height: number | null;
  weight: number | null;
  gender: string;
  style_preferences: string[];
}

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'body' | 'style' | 'password' | 'blocked'>('profile');

  // Blocked users
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  
  // Profile fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Body specs
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  
  // Style preferences
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSection === 'blocked' && user) {
      fetchBlockedUsers();
    }
  }, [activeSection, user]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setUser(user);
    
    const { data: profile } = await (supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as any);
    
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setGender(profile.gender || '');
      setStylePreferences(profile.style_preferences || []);
    }
    
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          avatar_url: avatarUrl,
          height: height ? parseInt(height) : null,
          weight: weight ? parseInt(weight) : null,
          gender,
          style_preferences: stylePreferences,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update failed:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change failed:', error);
      alert('Failed to change password: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStylePreference = (style: string) => {
    setStylePreferences(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const blocked = await getBlockedUsers(user.id);
      setBlockedUsers(blocked);
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
    }
  };

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to unblock this user?')) return;

    try {
      await unblockUser(user.id, blockedId);
      setBlockedUsers(prev => prev.filter(b => b.blocked_id !== blockedId));
      // Invalidate cache so unblocked user's posts appear immediately
      queryClient.invalidateQueries({ queryKey: ['style-posts'] });
      alert('User unblocked successfully.');
    } catch (error) {
      console.error('Failed to unblock user:', error);
      alert('Failed to unblock user.');
    }
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

  return (
    <Layout>
      <div className="max-w-lg mx-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Edit Profile</h1>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'profile' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection('body')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'body' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveSection('style')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'style' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'password' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveSection('blocked')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'blocked' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            Blocked
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              {avatarUrl && (
                <div className="mt-3 flex justify-center">
                  <img src={avatarUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Body Section */}
        {activeSection === 'body' && (
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {FILTERS.gender.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g.toLowerCase())}
                    className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                      gender === g.toLowerCase()
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                min={100}
                max={250}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                min={30}
                max={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Body specs help AI Stylist give you better recommendations
            </p>
            
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Body Specs'}
            </button>
          </div>
        )}

        {/* Style Section */}
        {activeSection === 'style' && (
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Style Preferences</label>
              <p className="text-xs text-gray-500 mb-4">Select your favorite styles (multiple selection allowed)</p>
              <div className="grid grid-cols-2 gap-2">
                {FILTERS.style.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStylePreference(style.toLowerCase())}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      stylePreferences.includes(style.toLowerCase())
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            {stylePreferences.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Selected styles:</p>
                <div className="flex flex-wrap gap-2">
                  {stylePreferences.map((style) => (
                    <span key={style} className="px-2 py-1 bg-black text-white text-xs rounded-full capitalize">
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Style Preferences'}
            </button>
          </div>
        )}

        {/* Password Section */}
        {activeSection === 'password' && (
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>

            <button
              onClick={handleChangePassword}
              disabled={saving || !newPassword || !confirmPassword}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {/* Blocked Users Section */}
        {activeSection === 'blocked' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-semibold">Blocked Users</h3>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              You won't see posts, comments, or interactions from blocked users.
            </p>

            {blockedUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Ban className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No blocked users</p>
                <p className="text-xs text-gray-400 mt-1">
                  Users you block will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map((block: any) => {
                  const blockedUser = block.blocked_user;
                  const displayName = blockedUser?.username?.includes('@')
                    ? blockedUser.username.split('@')[0]
                    : blockedUser?.username || blockedUser?.email?.split('@')[0] || 'Unknown User';

                  return (
                    <div
                      key={block.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {blockedUser?.avatar_url ? (
                          <img
                            src={blockedUser.avatar_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{displayName}</p>
                        {blockedUser?.email && (
                          <p className="text-xs text-gray-500 truncate">{blockedUser.email}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          Blocked {new Date(block.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleUnblock(block.blocked_id)}
                        className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
