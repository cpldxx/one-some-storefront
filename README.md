# One Some - 스타일 커뮤니티 플랫폼

무신사 스냅 스타일의 패션 커뮤니티 플랫폼입니다.

## 🎯 프로젝트 개요

**One Some**은 사용자들이 자신의 OOTD(Outfit Of The Day)를 공유하고, 스타일을 발견하며, 함께 커뮤니티를 만드는 소셜 패션 플랫폼입니다.

### 주요 특징
- ✨ **AI Picks**: 개인화된 스타일 추천
- 🔥 **Trending Now**: 인기 스타일 발견
- 💬 **커뮤니티**: 스타일 공유 및 피드백
- 🏷️ **스마트 필터**: 시즌, 스타일, 브랜드로 검색
- 📸 **이미지 최적화**: 자동 압축 및 R2 저장

## 🏗️ 기술 스택

### 프론트엔드
- **React 19** + **TypeScript** - UI 개발
- **Vite** - 빌드 도구
- **Tailwind CSS** + **shadcn/ui** - 스타일링
- **Framer Motion** - 애니메이션
- **React Router** - 라우팅

### 백엔드 & 인프라
- **Supabase** - PostgreSQL 데이터베이스 & Auth
- **Cloudflare R2** - 이미지 저장소
- **Supabase Edge Functions** - 서버리스 함수

### 상태 관리 & 데이터 페칭
- **React Query (TanStack Query)** - 데이터 페칭 & 캐싱
- **Zustand** - 클라이언트 상태 관리
- **React Hook Form** - 폼 관리

## 🚀 시작하기

### 1단계: 저장소 클론
```bash
git clone <repository-url>
cd one-some-storefront
```

### 2단계: 의존성 설치
```bash
npm install
```

### 3단계: 환경 변수 설정
```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 수정하여 다음 값을 추가합니다:
```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Cloudflare R2
VITE_R2_ACCOUNT_ID=xxxxxx
VITE_R2_BUCKET_NAME=one-some-storefront
VITE_R2_ENDPOINT=https://xxxxxx.r2.cloudflarestorage.com
```

자세한 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참고하세요.

### 4단계: 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

## 📁 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── Index.tsx      # 랜딩 페이지
│   ├── Community.tsx  # 커뮤니티 피드
│   └── ShopPage.tsx   # 쇼핑 페이지
├── features/          # 기능 컴포넌트
│   ├── community/     # 커뮤니티 관련
│   │   ├── StyleCard.tsx
│   │   ├── StyleGrid.tsx
│   │   ├── UploadModal.tsx
│   │   └── FilterBar.tsx
│   ├── landing/       # 랜딩 페이지 섹션
│   └── layout/        # 레이아웃
├── lib/               # 유틸리티 함수
│   ├── supabase.ts   # Supabase 클라이언트
│   ├── community.ts  # 커뮤니티 API
│   ├── upload.ts     # R2 이미지 업로드
│   └── shopify.ts    # Shopify API
├── types/             # TypeScript 타입
│   └── database.ts    # Supabase 스키마
└── stores/            # Zustand 스토어
```

## 🗄️ 데이터베이스 스키마

### Posts 테이블
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  description TEXT,
  tags JSONB,  -- { season, style, brand, category }
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 주요 테이블
- **profiles** - 사용자 프로필
- **posts** - OOTD 포스트
- **likes** - 좋아요 기록
- **comments** - 댓글

자세한 스키마는 [supabase/migrations/001_init.sql](./supabase/migrations/001_init.sql)를 참고하세요.

## 📚 문서

- [**SUPABASE_SETUP.md**](./SUPABASE_SETUP.md) - Supabase & R2 설정 가이드
- [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) - 기술 상세 문서
- [**MIGRATION_SUMMARY.md**](./MIGRATION_SUMMARY.md) - 마이그레이션 완료 요약
- [**FINAL_CHECKLIST.md**](./FINAL_CHECKLIST.md) - 배포 전 체크리스트

## 🎨 주요 기능

### 커뮤니티 피드
- 무한 스크롤 페이지네이션
- OOTD 포스트 공유
- 좋아요 및 댓글 기능
- 스마트 태그 필터링

### 포스트 생성
- 이미지 자동 압축 (1080px, 1MB 이하)
- 태그 선택 (Season, Style, Brand, Category)
- Cloudflare R2에 직접 업로드
- 실시간 미리보기

### 스타일 발견
- AI Picks - 개인화된 추천
- Trending Now - 인기 스타일
- 스마트 필터 - 상세 검색
- 사용자 프로필

## 🚀 배포

### Vercel에 배포
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel
```

### 환경 변수 설정
Vercel 프로젝트 설정에서 다음 환경 변수를 추가합니다:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_R2_ACCOUNT_ID
- VITE_R2_BUCKET_NAME
- VITE_R2_ENDPOINT

자세한 배포 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#프로덕션-배포)를 참고하세요.

## 🧪 테스트

```bash
# 유닛 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

## 🐛 문제 해결

### 이미지 업로드 실패
1. R2 API Token 권한 확인
2. Presigned URL 만료 확인 (1시간)
3. 브라우저 콘솔 에러 메시지 확인

### Supabase 연결 실패
1. `.env.local` 환경 변수 확인
2. Supabase 프로젝트 상태 확인
3. 네트워크 요청 디버깅

자세한 트러블슈팅은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#-문제-해결)를 참고하세요.

## 📊 성능 최적화

- ✅ 이미지 자동 압축 (browser-image-compression)
- ✅ Presigned URL (서버 부하 감소)
- ✅ React Query 캐싱 (반복 요청 제거)
- ✅ 무한 스크롤 (페이지네이션)

## 🔮 로드맵

### Phase 1: 인증 (2026-02)
- [ ] Supabase Auth 통합
- [ ] Google/GitHub 로그인
- [ ] 사용자 프로필 페이지

### Phase 2: 사회적 기능 (2026-03)
- [ ] 팔로우/팔로워 시스템
- [ ] 사용자 검색
- [ ] 알림 기능

### Phase 3: 고급 기능 (2026-04)
- [ ] 실시간 업데이트
- [ ] 벡터 검색 (유사 스타일 추천)
- [ ] 해시태그 탐색

## 🤝 기여

버그 리포트, 기능 제안, Pull Request를 환영합니다!

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
src/
  ├── components/      # 재사용 가능한 UI 컴포넌트
  ├── features/        # 기능별 컴포넌트
  │   ├── cart/       # 장바구니
  │   ├── landing/    # 랜딩 페이지 섹션
  │   ├── layout/     # 레이아웃
  │   └── products/   # 상품 관련
  ├── hooks/          # 커스텀 훅
  ├── lib/            # 유틸리티 및 API
  ├── pages/          # 페이지 컴포넌트
  └── stores/         # 상태 관리
```

## 🛠️ 기술 스택

- **프론트엔드**: React 18, TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **번들러**: Vite
- **상태 관리**: Zustand
- **애니메이션**: Framer Motion
- **캐러셀**: Embla Carousel
- **API**: Shopify Storefront API (GraphQL)

## 📦 주요 기능

- ✨ 부드러운 스크롤 애니메이션
- 🎠 자동 재생 프로모션 캐러셀 (3초마다 전환)
- 🛒 동적 장바구니 관리
- ❤️ 찜하기 기능
- 🔍 상품 검색
- 📱 반응형 디자인

## 🔗 Shopify 연동

현재 `one-some-storefront-592cz.myshopify.com`의 Shopify Storefront API와 연동되어 있습니다.

API 설정은 `src/lib/shopify.ts`에서 관리됩니다.

## 💻 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린팅 검사
npm run lint

# 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch
```

## 📝 라이선스

MIT

## 👨‍💻 개발자

One Some Team
