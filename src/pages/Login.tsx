import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 로그인 함수
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // 로그인 시도
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/'); // 성공하면 메인으로
    setLoading(false);
  };

  // 회원가입 함수
  const handleSignUp = async () => {
    setLoading(true);
    // 회원가입 시도
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('가입 성공! 로그인 버튼을 눌러주세요.');
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-80">
        <h1 className="mb-6 text-2xl font-bold text-center">로그인</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email" placeholder="이메일" required
            className="p-2 border rounded"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="비밀번호" required
            className="p-2 border rounded"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 p-2 text-white bg-black rounded">
              로그인
            </button>
            <button type="button" onClick={handleSignUp} disabled={loading} className="flex-1 p-2 bg-gray-200 rounded">
              가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
