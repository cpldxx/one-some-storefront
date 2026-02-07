import { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Lock, Ruler, Weight, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/features/layout/Layout';
import { supabase } from '@/lib/supabase';
import { FILTERS } from '@/constants/filters';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'body' | 'style' | 'password'>('profile');
  
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
            <User className="w-4 h-4 inline mr-1" /> Profile
          </button>
          <button
            onClick={() => setActiveSection('body')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'body' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            <Ruler className="w-4 h-4 inline mr-1" /> Body
          </button>
          <button
            onClick={() => setActiveSection('style')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'style' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-1" /> Style
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeSection === 'password' ? 'border-b-2 border-black' : 'text-gray-400'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-1" /> Password
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
      </div>
    </Layout>
  );
}
