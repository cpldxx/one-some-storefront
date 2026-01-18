# 🎯 다음 단계 - Quick Reference

## 지금 바로 해야 할 일 (5분 안에)

### 1. Supabase 대시보시 접속
```
https://app.supabase.com
프로젝트: mdbjlufzfstekqgjceuq
```

### 2. Edge Function 환경 변수 설정
1. **Settings** → **Edge Functions** (또는 왼쪽 메뉴)
2. `upload-url` 함수 찾기 (아직 없으면 배포 후 진행)
3. **Environment variables** 또는 **Secrets** 탭
4. 다음 5개 변수 추가:

```
R2_ACCOUNT_ID = 3713eb9d93193241756e5001f913fac2
R2_ACCESS_KEY = 19279e8794cf33f5db74d2a8c8e24f5d
R2_SECRET_KEY = 989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7
R2_BUCKET_NAME = one-some-storefront
R2_ENDPOINT = https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

### 3. 터미널에서 함수 배포
```bash
cd /Users/cpldxx/one-some-storefront

# Supabase CLI 설치 (처음 한 번만)
npm install -g supabase

# Supabase 로그인 (처음 한 번만)
supabase login

# 프로젝트 연결 (처음 한 번만)
supabase link --project-ref mdbjlufzfstekqgjceuq

# 함수 배포
supabase functions deploy upload-url
```

### 4. 성공 확인
```bash
supabase functions list
# 출력에 upload-url이 보이면 성공!
```

---

## 데이터베이스 마이그레이션 (5분)

### 1. Supabase 대시보드에서 SQL 실행
1. **SQL Editor** 클릭
2. **New Query** 클릭
3. `supabase/migrations/001_init.sql` 파일 열기
4. 전체 내용 복사
5. SQL 에디터에 붙여넣기
6. **RUN** 클릭

### 2. 테이블 확인
1. **Table Editor** 클릭
2. 다음 4개 테이블이 보이는지 확인:
   - `profiles`
   - `posts`
   - `likes`
   - `comments`

---

## 로컬 테스트 (2분)

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저에서 열기
http://localhost:5173/community

# 3. 테스트
# - "Create Post" 버튼 클릭
# - 이미지 선택
# - 설명 입력
# - 태그 선택
# - "Create Post" 제출
```

**성공 표지:**
- 이미지 업로드 진행률 표시
- 수초 후 "Post created successfully" 메시지
- 피드에 새 포스트 나타남

**실패 시:**
1. 브라우저 개발자 도구 → Network 탭 확인
2. `upload-url` 요청의 상태 코드 확인
   - 200: 성공
   - 500: Edge Function 환경 변수 미설정
   - CORS 에러: R2 CORS 설정 필요
3. Console 탭에서 에러 메시지 확인

---

## 중요한 파일들

### 📖 가이드 문서
- **SESSION_SUMMARY.md** ← 지금 읽고 있는 파일
- **EDGE_FUNCTION_DEPLOYMENT.md** - 배포 상세 가이드
- **SUPABASE_SETUP.md** - 전체 설정 가이드
- **IMPLEMENTATION_GUIDE.md** - API 및 데이터 구조

### 💻 주요 코드 파일
```
src/
├── lib/
│   ├── supabase.ts ✅ Supabase 클라이언트
│   ├── upload.ts ✅ 이미지 업로드 로직
│   ├── community.ts ✅ 커뮤니티 API
│   └── auth.ts 📋 미생성 (인증 필요)
├── features/community/
│   ├── UploadModal.tsx ✅ 포스트 업로드
│   ├── StyleGrid.tsx ✅ 무한 스크롤 피드
│   ├── StyleCard.tsx ✅ 포스트 카드
│   ├── FilterBar.tsx ⚠️ UI만 있음
│   ├── CommentsSection.tsx 📋 미생성
│   └── CommentForm.tsx 📋 미생성
└── types/
    └── database.ts ✅ TypeScript 타입 정의

supabase/
├── migrations/001_init.sql ✅ 데이터베이스 스키마
├── functions/upload-url/index.ts ✅ Edge Function
└── config.json ✅ Supabase 설정
```

---

## 환경 변수 확인

### .env.local (프론트엔드)
```bash
cat .env.local | grep -E "VITE_SUPABASE|VITE_R2"
```

**기대 출력:**
```
VITE_SUPABASE_URL=https://mdbjlufzfstekqgjceuq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_QOVWKiwU8EuQoi_4vhoNLA_ljUfytyr
VITE_R2_ACCOUNT_ID=3713eb9d93193241756e5001f913fac2
VITE_R2_ACCESS_KEY_ID=19279e8794cf33f5db74d2a8c8e24f5d
VITE_R2_SECRET_ACCESS_KEY=989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7
VITE_R2_BUCKET_NAME=one-some-storefront
VITE_R2_ENDPOINT=https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

✅ 모두 설정되어 있습니다!

---

## 문제 발생 시

### Edge Function 500 에러
```
Preflight response is not successful. Status code: 500
```

**원인:** 환경 변수 미설정
**해결:** EDGE_FUNCTION_DEPLOYMENT.md의 "Step 3" 참고

### R2 업로드 실패
```
Error: Access Denied
```

**원인:** R2 API Token 권한 부족
**해결:**
1. Cloudflare 대시보드 → API Tokens
2. 토큰 권한에 `Object.buckets.contents:write` 확인

### CORS 에러
```
Access to fetch blocked by CORS policy
```

**해결:**
1. R2 버킷 CORS 설정 추가
2. Edge Function CORS 헤더 확인 (이미 설정됨)

---

## 체크리스트

### Phase 1: 배포 (지금 하기)
- [ ] Supabase 대시보드에서 Edge Function 환경 변수 설정
- [ ] CLI로 함수 배포 (`supabase functions deploy upload-url`)
- [ ] 배포 확인 (`supabase functions list`)
- [ ] 로컬 테스트 (이미지 업로드)

### Phase 2: 데이터베이스 (1-2시간)
- [ ] 데이터베이스 마이그레이션 (SQL 실행)
- [ ] 테이블 확인
- [ ] 초기 테스트 데이터 생성 (선택사항)

### Phase 3: 인증 (3-4시간)
- [ ] Supabase Auth 통합
- [ ] 로그인/회원가입 UI
- [ ] 프로필 페이지
- [ ] 임시 userId 제거

### Phase 4: 추가 기능 (다음 주)
- [ ] 댓글 기능
- [ ] Follow 기능
- [ ] 필터 완성
- [ ] Real-time 업데이트

---

## 빠른 명령어 모음

```bash
# 개발 서버 시작
npm run dev

# 프로젝트 빌드 확인
npm run build

# Supabase 함수 배포
supabase functions deploy upload-url

# 함수 목록 확인
supabase functions list

# 함수 로그 보기
supabase functions logs upload-url

# 로컬 Supabase 에뮬레이터 시작 (선택사항)
supabase start

# Supabase 에뮬레이터 중지
supabase stop
```

---

## 도움말

각 문서의 구체적인 내용:

- **첫 배포 시:** `EDGE_FUNCTION_DEPLOYMENT.md` 읽기
- **환경 변수 모르겠을 때:** `SUPABASE_SETUP.md`의 "환경 변수 설정" 섹션
- **API 함수 사용 방법:** `IMPLEMENTATION_GUIDE.md`
- **데이터 구조:** `src/types/database.ts`

---

**다음 단계:** Edge Function 배포하고 로컬 테스트하기!
