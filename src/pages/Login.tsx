import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AlertCircle, X, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if coming from successful signup
  const signupSuccess = location.state?.signupSuccess;

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Translate common error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else {
        setError(error.message);
      }
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="mb-6 text-2xl font-bold text-center">Login</h1>
        
        {/* Success Message from Signup */}
        {signupSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">Account created! Please check your email to verify, then login.</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <button 
              type="button" 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" 
              placeholder="your@email.com" 
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" 
              placeholder="Enter your password" 
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
