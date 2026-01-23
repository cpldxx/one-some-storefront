import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { FILTERS } from '@/constants/filters';
import { Check, AlertCircle, X } from 'lucide-react';

// Password validation
const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return { minLength, hasUpperCase, hasSpecialChar, isValid: minLength && hasUpperCase && hasSpecialChar };
};

export default function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Body & Style
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Basic Info
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2: Body & Style
  const [height, setHeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);

  // Convert height to cm for storage
  const getHeightInCm = () => {
    if (heightUnit === 'cm') {
      if (!height) return null;
      return parseFloat(height);
    } else {
      // ft/in to cm
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      if (feet === 0 && inches === 0) return null;
      const totalInches = (feet * 12) + inches;
      return Math.round(totalInches * 2.54);
    }
  };

  // Convert weight to kg for storage
  const getWeightInKg = () => {
    if (!weight) return null;
    const value = parseFloat(weight);
    return weightUnit === 'lb' ? Math.round(value * 0.453592) : value;
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleStyleToggle = (style: string) => {
    setPreferredStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!passwordValidation.isValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    
    setStep(2);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const heightInCm = getHeightInCm();
    const weightInKg = getWeightInKg();

    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            height: heightInCm,
            weight: weightInKg,
            preferred_styles: preferredStyles,
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

            // Update profile in profiles table
      if (data.user) {
        const { error: profileError } = await (supabase
          .from('profiles') as any)
          .upsert({
            id: data.user.id,
            username,
            height: heightInCm,
            weight: weightInKg,
            preferred_styles: preferredStyles,
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      // Success - show success message briefly then redirect
      setError(null);
      navigate('/login', { state: { signupSuccess: true } });
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-center">Sign Up</h1>
        <p className="mb-6 text-sm text-gray-500 text-center">
          Step {step} of 2: {step === 1 ? 'Account Info' : 'Style Profile'}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

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

        {step === 1 ? (
          /* Step 1: Basic Info */
          <form onSubmit={handleNextStep} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                required
                minLength={2}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className={`w-3 h-3 ${passwordValidation.minLength ? '' : 'opacity-30'}`} />
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className={`w-3 h-3 ${passwordValidation.hasUpperCase ? '' : 'opacity-30'}`} />
                  At least 1 uppercase letter
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className={`w-3 h-3 ${passwordValidation.hasSpecialChar ? '' : 'opacity-30'}`} />
                  At least 1 special character (!@#$%^&*)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                required
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800 font-medium mt-2"
            >
              Next
            </button>
          </form>
        ) : (
          /* Step 2: Body & Style */
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {/* Body Measurements - Two Boxes */}
            <div className="grid grid-cols-2 gap-3">
              {/* Height Box */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Height</label>
                  {/* Toggle Switch */}
                  <div className="flex bg-gray-100 rounded-full p-0.5">
                    <button
                      type="button"
                      onClick={() => setHeightUnit('cm')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                        heightUnit === 'cm' 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit('ft')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                        heightUnit === 'ft' 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      ft
                    </button>
                  </div>
                </div>
                {heightUnit === 'cm' ? (
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="175"
                      min="100"
                      max="250"
                      className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      cm
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="5"
                        min="3"
                        max="7"
                        className="w-full p-3 pr-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">′</span>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="9"
                        min="0"
                        max="11"
                        className="w-full p-3 pr-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">″</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weight Box */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Weight</label>
                  {/* Toggle Switch */}
                  <div className="flex bg-gray-100 rounded-full p-0.5">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                        weightUnit === 'kg' 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('lb')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                        weightUnit === 'lb' 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      lb
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={weightUnit === 'kg' ? '70' : '154'}
                    min={weightUnit === 'kg' ? '30' : '66'}
                    max={weightUnit === 'kg' ? '200' : '440'}
                    className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-center text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {weightUnit}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Styles <span className="text-gray-400 font-normal">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FILTERS.style.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleStyleToggle(style)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      preferredStyles.includes(style)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 p-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 p-3 text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
