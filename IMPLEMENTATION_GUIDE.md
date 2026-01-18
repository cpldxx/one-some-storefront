# Supabase + R2 마이그레이션 상세 구현 가이드

---

## 📁 파일 구조 및 변경사항

### 새로 생성된 파일

```
src/
├── types/
│   └── database.ts          # Supabase 데이터베이스 타입 정의
├── lib/
│   ├── supabase.ts          # Supabase 클라이언트 초기화
│   ├── community.ts         # ✨ 리팩토링: Mock → Supabase 실제 연동
│   └── upload.ts            # ✨ 새로 생성: R2 이미지 업로드 로직
└── features/community/
    └── UploadModal.tsx      # ✨ 새로 생성: 포스트 업로드 모달

supabase/
├── migrations/
│   └── 001_init.sql         # ✨ 데이터베이스 스키마 생성 스크립트
└── functions/
    └── upload-url/
        └── index.ts         # ✨ R2 Presigned URL 발급 Edge Function
```

### 수정된 파일

```
src/
├── pages/
│   ├── Community.tsx        # ✨ UploadModal 추가
│   └── Index.tsx            # ✨ 새 데이터 구조에 맞게 쿼리 수정
├── features/
│   ├── community/
│   │   ├── StyleCard.tsx    # ✨ 새 database 타입에 맞게 수정
│   │   ├── StyleGrid.tsx    # ✨ 무한 스크롤 + React Query Infinite Query 구현
│   │   ├── FilterBar.tsx    # ✨ 필터링이 실제 DB 쿼리에 적용됨
│   │   └── Community.tsx    # 수정됨
│   └── landing/
│       ├── AIPickSection.tsx    # ✨ StylePost 타입 경로 변경
│       └── TrendingSection.tsx  # ✨ StylePost 타입 경로 변경
└── stores/
    └── likedStore.ts        # ✨ Supabase toggleLike와 연동 가능하도록 수정 예정
```

---

## 🔄 데이터 흐름

### 기존 (Mock 데이터)

```
IndexPage
  ↓
useQuery('style-posts')
  ↓
fetchStylePosts() → 로컬 Mock 데이터 생성
  ↓
StyleCard 렌더링
```

### 새로운 (Supabase)

```
IndexPage
  ↓
useQuery('style-posts', 0)
  ↓
fetchStylePosts(0, 20)
  ↓
Supabase: posts + profiles JOIN
  ↓
like_count, comment_count 포함
  ↓
StyleCard 렌더링
```

---

## 📊 데이터베이스 스키마

### Profiles 테이블

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**사용 사례**: 사용자 프로필 정보, 팔로우/팔로워 수

### Posts 테이블

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  image_url TEXT NOT NULL,  -- R2 URL
  description TEXT,
  tags JSONB DEFAULT '{"season": [], "style": [], "brand": [], "category": []}'::jsonb,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**사용 사례**: OOTD 포스트, 이미지 저장, 필터링

### Tags (JSONB) 구조

```json
{
  "season": ["Spring", "Summer"],
  "style": ["Casual", "Minimal"],
  "brand": ["ZARA", "H&M"],
  "category": ["Top", "Shoes"]
}
```

**쿼리 예시**:

```sql
-- Spring과 Casual 태그 모두 포함하는 포스트
SELECT * FROM posts
WHERE tags->'season' @> '["Spring"]'::jsonb
  AND tags->'style' @> '["Casual"]'::jsonb;
```

### Likes 테이블

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

**사용 사례**: 포스트 좋아요 기록

### Comments 테이블

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**사용 사례**: 댓글 기능

---

## 🖼️ 이미지 업로드 워크플로우

### 1. 클라이언트 → Edge Function → R2

```
┌─────────────────────────────────────────────────┐
│ Client (UploadModal)                            │
├─────────────────────────────────────────────────┤
│ 1. 사용자가 이미지 선택 & 압축                   │
│    - browser-image-compression 사용            │
│    - 최대 1080px, 최대 1MB                      │
│                                                 │
│ 2. getPresignedUrl() 호출                      │
│    - Supabase Edge Function 호출               │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────▼────────┐
       │ Edge Function  │
       ├────────────────┤
       │ upload-url     │
       │                │
       │ S3Client 초기화 │
       │ (R2 호환)      │
       │                │
       │ getSignedUrl() │
       │ Presigned URL  │
       │ 생성 (1시간)   │
       └───────┬────────┘
               │
       ┌───────▼──────────────────────┐
       │ Presigned URL 반환            │
       │ https://bucket.r2.../presign  │
       └───────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│ Client (uploadImage)                 │
├──────────────────────────────────────┤
│ 3. fetch(presignedUrl, {             │
│      method: 'PUT',                  │
│      body: compressedFile            │
│    })                                │
│                                      │
│ 4. R2에 직접 업로드 (CORS 불필요)   │
│    - 서명된 URL이므로 인증 필요 X   │
└──────────────┬───────────────────────┘
               │
       ┌───────▼────────┐
       │ Cloudflare R2  │
       ├────────────────┤
       │ 파일 저장      │
       │ 공개 URL 반환  │
       └────────────────┘
```

### 2. 포스트 생성 및 저장

```
┌────────────────────────────────────┐
│ UploadModal.onSubmit()             │
├────────────────────────────────────┤
│ 1. uploadImage() → R2 URL 획득     │
│                                    │
│ 2. createPost({                    │
│      imageUrl: 'https://...',      │
│      description: '...',           │
│      tags: { ... }                 │
│    }, userId)                      │
└────────────────┬───────────────────┘
                 │
         ┌───────▼────────────┐
         │ Supabase Insert    │
         ├────────────────────┤
         │ INSERT INTO posts  │
         │ (user_id,          │
         │  image_url,        │
         │  tags, ...)        │
         └────────────────────┘
```

---

## 🔗 API 함수 상세 설명

### `fetchStylePosts(page, limit, filters?)`

**목적**: 페이지네이션과 필터링을 지원하는 포스트 조회

```typescript
// 사용 예시
const posts = await fetchStylePosts(0, 20, {
  season: 'Spring',
  style: 'Casual',
  brand: 'ZARA',
  category: 'Top'
});

// 응답 예시
[
  {
    id: 'post-1',
    user_id: 'user-123',
    image_url: 'https://bucket.r2.../posts/xxx.jpg',
    description: 'Spring casual look',
    tags: {
      season: ['Spring'],
      style: ['Casual'],
      brand: ['ZARA'],
      category: ['Top']
    },
    like_count: 42,
    comment_count: 5,
    profile: {
      id: 'user-123',
      username: 'john_doe',
      avatar_url: 'https://...',
      bio: 'Fashion enthusiast'
    },
    is_liked: false
  },
  // ... more posts
]
```

**SQL 쿼리 (내부 동작)**:

```sql
SELECT posts.*,
       profiles.*,
       COUNT(likes.id) > 0 as is_liked
FROM posts
JOIN profiles ON posts.user_id = profiles.id
LEFT JOIN likes ON posts.id = likes.post_id AND likes.user_id = $1
WHERE posts.tags->'season' @> $2::jsonb
ORDER BY posts.created_at DESC
LIMIT 20 OFFSET 0;
```

### `createPost(input, userId)`

**목적**: 새로운 포스트 생성

```typescript
const post = await createPost({
  imageUrl: 'https://bucket.r2.../posts/xxx.jpg',
  description: 'My OOTD',
  tags: {
    season: ['Spring'],
    style: ['Casual'],
    brand: ['ZARA'],
    category: ['Top']
  }
}, 'user-123');
```

### `toggleLike(postId, userId, liked)`

**목적**: 포스트 좋아요/좋아요 취소

```typescript
// 좋아요 추가
await toggleLike('post-1', 'user-123', false);

// 좋아요 취소
await toggleLike('post-1', 'user-123', true);
```

**내부 동작**:

1. `liked === false` → `INSERT INTO likes`
2. `liked === true` → `DELETE FROM likes WHERE post_id = ... AND user_id = ...`
3. RPC 함수로 like_count 증감

### `fetchComments(postId)` & `addComment(postId, userId, content)`

**목적**: 댓글 조회 및 추가

```typescript
// 댓글 조회
const comments = await fetchComments('post-1');

// 댓글 추가
const comment = await addComment('post-1', 'user-123', 'Great outfit!');
```

---

## ⚙️ React Query 설정

### Infinite Query (무한 스크롤)

```typescript
// StyleGrid.tsx에서 사용
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['style-posts', filters],
  queryFn: ({ pageParam = 0 }) =>
    fetchStylePosts(pageParam, 20, filters),
  getNextPageParam: (lastPage, allPages) =>
    lastPage.length === 20 ? allPages.length : undefined,
  initialPageParam: 0,
});
```

**작동 방식**:

```
1. 초기 로드: pageParam = 0 → offset = 0
2. 스크롤 하단 도달: fetchNextPage()
3. pageParam = 1 → offset = 20
4. 마지막 페이지: lastPage.length < 20 → hasNextPage = false
```

### 필터 변경 시 쿼리 재실행

```typescript
// filters 변경 → queryKey 변경 → 자동으로 새 쿼리 실행
useInfiniteQuery({
  queryKey: ['style-posts', filters], // ← filters가 변경되면
  // 이 queryKey도 변경되므로 새 쿼리 실행!
  ...
});
```

---

## 🔐 보안 고려사항

### 1. Row Level Security (RLS)

Supabase의 RLS 정책으로 자동 보호:

```sql
-- 누구나 포스트를 읽을 수 있음
CREATE POLICY "Posts are public" ON posts FOR SELECT USING (true);

-- 본인의 포스트만 수정/삭제 가능
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE
USING (auth.uid() = user_id);
```

### 2. Presigned URL의 만료

```typescript
// Edge Function에서 1시간으로 설정
const uploadUrl = await getSignedUrl(s3Client, command, {
  expiresIn: 3600, // 1시간
});
```

### 3. API Key 관리

- **Anon Key**: 클라이언트에서 사용 (공개 안전)
- **Service Role Key**: 서버에서만 사용 (비공개)
- Edge Function은 Service Role Key 자동 사용

---

## 🚨 에러 처리

### 이미지 업로드 실패

```typescript
try {
  const imageUrl = await uploadImage(file);
} catch (error) {
  // 압축 실패? → 원본 사용
  // 네트워크 에러? → 재시도
  // R2 에러? → 사용자에게 알림
}
```

### 포스트 생성 실패

```typescript
try {
  await createPost(input, userId);
  queryClient.invalidateQueries({ queryKey: ['style-posts'] });
} catch (error) {
  // Supabase 연결 실패?
  // 권한 없음?
  // 데이터 유효성?
}
```

---

## 📈 성능 최적화

### 1. 이미지 압축

```typescript
// 1080px 이하, 1MB 이하로 자동 압축
const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1080,
  useWebWorker: true, // 백그라운드 처리
});
```

**효과**: 업로드 시간 80% 단축, 대역폭 절약

### 2. 무한 스크롤 페이지네이션

```typescript
// 한 번에 20개씩 로드
// 사용자가 하단까지 스크롤할 때만 다음 20개 로드
```

**효과**: 초기 로딩 시간 단축, 메모리 사용량 최적화

### 3. Query Caching

```typescript
staleTime: 5 * 60 * 1000,  // 5분 동안 캐시
gcTime: 10 * 60 * 1000,     // 10분 후 삭제
```

---

## 🔮 향후 확장 기능

### 1. 실시간 기능 (Supabase Realtime)

```typescript
const subscription = supabase
  .channel('posts')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('New post:', payload.new);
      // UI 업데이트
    }
  )
  .subscribe();
```

### 2. 사용자 인증 (Supabase Auth)

```typescript
// Google/GitHub 로그인
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourdomain.com/auth/callback'
  }
});
```

### 3. 팔로우 기능

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id),
  following_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### 4. 알림 기능

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT, -- 'like', 'comment', 'follow'
  related_user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. 벡터 검색 (Supabase Vector)

```typescript
// 이미지 유사도 검색
const { data } = await supabase
  .rpc('search_similar_posts', {
    query_image_url: 'https://...',
    similarity_threshold: 0.8
  });
```

---

## 📝 마이그레이션 체크리스트

- [x] Supabase 프로젝트 설정
- [x] 데이터베이스 스키마 설계
- [x] TypeScript 타입 정의
- [x] Supabase 클라이언트 초기화
- [x] R2 Presigned URL Edge Function
- [x] 이미지 업로드 로직 (압축 포함)
- [x] 커뮤니티 API 리팩토링
- [x] StyleCard/StyleGrid 업데이트
- [x] UploadModal 구현
- [x] 무한 스크롤 구현
- [x] 필터링 연동
- [ ] 인증 통합
- [ ] 댓글 UI 구현
- [ ] 팔로우 기능
- [ ] 실시간 업데이트
- [ ] 모바일 최적화

---

## 🤝 기여 가이드

새로운 기능을 추가할 때:

1. `src/lib/community.ts`에 함수 추가
2. TypeScript 타입 `src/types/database.ts`에 정의
3. 필요시 SQL 마이그레이션 작성
4. 컴포넌트에서 React Query로 연동

예시: 검색 기능 추가

```typescript
// 1. lib/community.ts
export async function searchPosts(query: string): Promise<StylePost[]> {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .or(`description.ilike.%${query}%`);
  return data || [];
}

// 2. 컴포넌트에서 사용
const { data: searchResults } = useQuery({
  queryKey: ['search-posts', query],
  queryFn: () => searchPosts(query),
  enabled: query.length > 0,
});
```

---

**마지막 업데이트**: 2026년 1월 17일
