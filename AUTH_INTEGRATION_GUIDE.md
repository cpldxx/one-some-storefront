# 🔐 다음 단계: Supabase Auth 통합 가이드

현재 UploadModal에서 임시 userId를 사용하고 있습니다. 이를 실제 사용자 인증으로 바꾸려면 이 가이드를 따르세요.

---

## 📋 필요한 작업

### Phase 1: Supabase Auth 설정 (Supabase 대시보드)

1. **프로젝트 접속**
   - https://app.supabase.com
   - 프로젝트: `mdbjlufzfstekqgjceuq`

2. **Auth 설정**
   - **Authentication** → **Providers**
   - **Email** 활성화 (기본값)
   - **Google OAuth** 추가 (선택사항)

3. **URL 설정**
   - **Project Settings** → **Authentication**
   - **Authorized redirect URLs** 추가:
     - `http://localhost:5173/**` (개발)
     - `http://localhost:3000/**` (개발)
     - `https://yourdomain.com/**` (프로덕션)

---

### Phase 2: 인증 라이브러리 생성

#### 파일: `src/lib/auth.ts`

```typescript
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 현재 세션 조회
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Google OAuth로 로그인
 */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

/**
 * 로그아웃
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * 비밀번호 초기화 링크 발송
 */
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
}

/**
 * 새 비밀번호 설정
 */
export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({
    password: newPassword,
  });
}
```

---

### Phase 3: useAuth Hook 생성

#### 파일: `src/hooks/useAuth.ts`

```typescript
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
```

---

### Phase 4: UploadModal 수정

#### 파일: `src/features/community/UploadModal.tsx`

**변경할 부분:**

```typescript
// BEFORE
import { useState } from 'react';
// ... 다른 import들

export function UploadModal() {
  // ... 다른 상태들
  
  const onSubmit = async (data: UploadFormData) => {
    // ...
    const userId = 'temp-user-id'; // ❌ 임시 값
    // ...
  };
}

// AFTER
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // ← 추가
// ... 다른 import들

export function UploadModal() {
  const { user } = useAuth(); // ← 추가
  // ... 다른 상태들
  
  const onSubmit = async (data: UploadFormData) => {
    if (!user) {
      alert('Please log in to create a post');
      return;
    }

    // ... 이미지 업로드 코드

    const userId = user.id; // ✅ 실제 사용자 ID
    // ...
  };
}
```

---

### Phase 5: 로그인/회원가입 페이지

#### 파일: `src/pages/Auth.tsx` (새로 생성)

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signIn, signUp } from '@/lib/auth';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert('Check your email for confirmation!');
      }
      navigate('/community');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full mt-4 text-sm text-gray-600 hover:underline"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </button>
      </Card>
    </div>
  );
}
```

---

### Phase 6: 라우팅 설정

#### 파일: `src/App.tsx` 수정

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/pages/Auth';
import { Community } from '@/pages/Community';
import { MyPage } from '@/pages/MyPage';
// ... 다른 import들

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        {user ? (
          <>
            <Route path="/community" element={<Community />} />
            <Route path="/my-page" element={<MyPage />} />
            <Route path="/" element={<Navigate to="/community" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/auth" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🧪 테스트

### 1. 로컬 환경에서 테스트

```bash
# 개발 서버 시작
npm run dev

# http://localhost:5173/auth 접속
# 이메일/비밀번호로 가입하기
# 로그인 후 /community로 이동
# Create Post 버튼 클릭 - 이제 실제 사용자 ID 사용
```

### 2. Supabase 데이터 확인

```bash
# Supabase 대시보시:
# 1. Authentication → Users
#    → 가입한 사용자 확인
# 2. Table Editor → posts
#    → user_id가 실제 사용자 ID로 저장됨 확인
```

---

## 🔒 보안 주의사항

1. **VITE_SUPABASE_ANON_KEY는 공개 가능**
   - 이것은 공개 키 (publishable key)입니다
   - 프론트엔드에서 노출되는 것이 정상입니다

2. **R2_SECRET_KEY는 공개하지 말기**
   - Edge Function에서만 사용됩니다
   - 환경 변수로 설정된 상태로 유지합니다

3. **RLS (Row Level Security) 설정**
   - 데이터베이스에 RLS 정책이 설정되어 있습니다
   - 사용자는 자신의 데이터만 수정 가능합니다

---

## 📊 구현 체크리스트

### Step 1: 라이브러리 생성
- [ ] `src/lib/auth.ts` 생성
- [ ] `src/hooks/useAuth.ts` 생성

### Step 2: 컴포넌트 수정
- [ ] `src/pages/Auth.tsx` 생성 (로그인/회원가입)
- [ ] `src/features/community/UploadModal.tsx` 수정 (임시 userId 제거)
- [ ] `src/App.tsx` 수정 (라우팅 설정)

### Step 3: 테스트
- [ ] 로컬에서 회원가입 테스트
- [ ] 로그인 후 포스트 생성 테스트
- [ ] Supabase에서 사용자 데이터 확인

### Step 4: 추가 기능 (선택사항)
- [ ] Google OAuth 통합
- [ ] 비밀번호 초기화
- [ ] 프로필 페이지 (MyPage)

---

## 예상 소요 시간

- **라이브러리 생성:** 20분
- **컴포넌트 수정:** 30분
- **테스트:** 15분
- **총 예상 시간:** 60-90분

---

## 참고 자료

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth Examples](https://supabase.com/docs/guides/auth/social-oauth)
- [Session Management](https://supabase.com/docs/guides/auth/sessions)

---

**이 가이드는 Phase 2 (인증) 작업용입니다.**
**Phase 1 (Edge Function 배포) 완료 후 진행하세요!**
