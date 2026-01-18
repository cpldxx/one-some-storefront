# Supabase + Cloudflare R2 마이그레이션 가이드

무신사 스냅 스타일의 커뮤니티 플랫폼을 Supabase + Cloudflare R2로 마이그레이션하는 완전한 가이드입니다.

---

## 📋 목차

1. [Supabase 설정](#supabase-설정)
2. [Cloudflare R2 설정](#cloudflare-r2-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [Supabase Edge Functions 배포](#supabase-edge-functions-배포)
5. [로컬 테스트](#로컬-테스트)
6. [프로덕션 배포](#프로덕션-배포)

---

## 🔐 Supabase 설정

### 1. Supabase 프로젝트 생성

1. [https://app.supabase.com](https://app.supabase.com) 방문
2. **New Project** 클릭
3. 프로젝트 설정:
   - **Name**: `one-some-storefront`
   - **Database Password**: 강력한 비밀번호 생성 (기억해두기!)
   - **Region**: 가장 가까운 지역 선택 (Asia - Singapore 추천)
   - **Pricing Plan**: `Free` 또는 `Pro` (필요에 따라)

### 2. Database 스키마 생성

1. Supabase 대시보드 → **SQL Editor**
2. **New Query** 클릭
3. `supabase/migrations/001_init.sql` 파일의 전체 코드 복사
4. SQL 에디터에 붙여넣고 **RUN** 클릭

```sql
-- 001_init.sql 파일의 전체 내용을 실행합니다
```

### 3. 프로젝트 설정값 확인

1. **Settings** → **API**
2. 다음 값들을 복사해서 기억하세요:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) Key**: `eyJhbGc...`

---

## 🗣️ Cloudflare R2 설정

### 1. Cloudflare 계정 생성 및 R2 활성화

1. [https://dash.cloudflare.com](https://dash.cloudflare.com) 방문
2. **R2 Object Storage** → **Create bucket**
3. 버킷 설정:
   - **Bucket name**: `one-some-storefront`
   - **Region**: 기본값 유지 (WNAM으로 자동 선택)

### 2. R2 API Token 생성

1. Cloudflare 대시보드 → **My Profile**
2. **API Tokens** → **Create Token**
3. 다음 권한으로 토큰 생성:
   - **Account Resources**:
     - Account → R2 → Edit
   - 토큰 생성 후 저장 (다시 볼 수 없음!)

### 3. R2 자격증명 확인

1. **R2** → **Bucket Settings**
2. 다음 정보 확인:
   - **Account ID**: `xxxxxx` (URL에서 확인: `https://dash.cloudflare.com/xxxxx/r2/...`)
   - **Bucket name**: `one-some-storefront`
   - **Endpoint**: `https://[account-id].r2.cloudflarestorage.com`

### 4. CORS 설정 (선택사항, 추후 필요시)

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 🔑 환경 변수 설정

### 1. `.env.local` 파일 업데이트

`.env.local` 파일을 다음과 같이 수정합니다:

```bash
# Existing Shopify variables
VITE_SHOPIFY_API_VERSION=2025-07
VITE_SHOPIFY_STORE_DOMAIN=one-some-2.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=cc6e1be8c1046c85ef37df07a1ab399e

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Cloudflare R2
VITE_R2_ACCOUNT_ID=xxxxxx
VITE_R2_BUCKET_NAME=one-some-storefront
VITE_R2_ENDPOINT=https://xxxxxx.r2.cloudflarestorage.com
```

### 2. Supabase Edge Function 환경 변수 설정

Supabase 대시보드 → **Project Settings** → **Edge Functions** 또는 **Function Settings**:

```bash
R2_ACCOUNT_ID=xxxxxx
R2_ACCESS_KEY=your-api-token-access-key
R2_SECRET_KEY=your-api-token-secret-key
R2_BUCKET_NAME=one-some-storefront
R2_ENDPOINT=https://xxxxxx.r2.cloudflarestorage.com
```

---

## 🚀 Supabase Edge Functions 배포

### 1. Supabase CLI 설치

```bash
npm install -g supabase
```

### 2. Supabase 로그인

```bash
supabase login
```

### 3. Edge Function 배포

```bash
# 프로젝트 디렉토리에서
supabase functions deploy upload-url
```

### 4. 배포 확인

```bash
supabase functions list
```

`upload-url` 함수가 나열되면 성공!

---

## 🧪 로컬 테스트

### 1. 로컬 Supabase 에뮬레이터 실행 (선택사항)

```bash
supabase start
```

### 2. 개발 서버 시작

```bash
npm run dev
```

### 3. 커뮤니티 페이지 테스트

1. 브라우저에서 `http://localhost:5173/community` 방문
2. **Create Post** 버튼 클릭
3. 이미지 업로드 및 태그 선택
4. **Create Post** 제출

### 4. 브라우저 콘솔 확인

- 네트워크 요청 확인
- 에러 메시지 검토

---

## 📤 프로덕션 배포

### 1. 프로덕션 Supabase 프로젝트 설정

위의 "Supabase 설정" 섹션을 프로덕션 환경에 대해 반복합니다.

### 2. 프로덕션 환경 변수 설정

호스팅 플랫폼(Vercel, Netlify 등)에서 환경 변수 추가:

```bash
VITE_SUPABASE_URL=https://prod-xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

VITE_R2_ACCOUNT_ID=xxxxxx
VITE_R2_BUCKET_NAME=one-some-storefront
VITE_R2_ENDPOINT=https://xxxxxx.r2.cloudflarestorage.com
```

### 3. 빌드 및 배포

```bash
npm run build
# 호스팅 플랫폼의 배포 명령어 실행
```

### 4. 프로덕션 테스트

- 커뮤니티 페이지에서 포스트 생성 테스트
- 이미지 업로드 확인
- R2에서 이미지 파일 확인

---

## 🔄 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 생성 (001_init.sql 실행)
- [ ] Cloudflare R2 버킷 생성
- [ ] R2 API Token 생성
- [ ] `.env.local` 파일 업데이트
- [ ] Supabase Edge Functions 배포
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 환경 설정
- [ ] 프로덕션 배포

---

## 🐛 문제 해결

### Edge Function 배포 실패

```bash
# 함수 로그 확인
supabase functions logs upload-url

# 함수 업데이트
supabase functions deploy upload-url --no-verify-jwt
```

### R2 업로드 실패

- R2 API Token 권한 확인
- CORS 설정 확인
- 브라우저 콘솔의 CORS 에러 메시지 검토

### Supabase 연결 실패

- `.env.local`의 URL과 Key 확인
- Supabase 프로젝트의 API 설정 다시 확인
- 브라우저 개발자 도구 → Network 탭에서 요청 검토

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Cloudflare R2 문서](https://developers.cloudflare.com/r2/)
- [AWS S3 API (R2 호환)](https://docs.aws.amazon.com/s3/)

---

## 🎯 다음 단계

1. **인증 통합**: Supabase Auth로 사용자 인증 구현
2. **팔로우 기능**: `follows` 테이블 추가 및 구현
3. **검색 기능**: Full-text search 또는 Supabase Vector 활용
4. **실시간 기능**: Supabase Realtime으로 라이브 업데이트
5. **모바일 최적화**: React Native 또는 PWA 버전 개발
