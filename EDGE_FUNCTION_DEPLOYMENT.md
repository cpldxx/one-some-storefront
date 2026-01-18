# Edge Function 배포 가이드

이 문서는 Supabase Edge Function (`upload-url`)을 배포하고 R2 환경 변수를 설정하는 방법을 설명합니다.

## 🔍 현재 상황

**에러**: `Edge Function 500 error - Preflight response is not successful`

**원인**: Edge Function이 배포되지 않았거나, 환경 변수가 설정되지 않았음.

---

## 📋 사전 확인 사항

1. Supabase 프로젝트 생성 완료: ✅ `https://mdbjlufzfstekqgjceuq.supabase.co`
2. Cloudflare R2 버킷 생성 완료: ✅ `one-some-storefront`
3. R2 API Token 생성 완료: ⚠️ **필수 - 아래 참고**
4. `.env.local` 파일 설정 완료: ✅

---

## 🔐 Step 1: Cloudflare R2 API Token 확인

이 단계는 Edge Function에 Cloudflare R2 접근 권한을 주기 위함입니다.

### 1.1 기존 API Token 확인

```bash
# 현재 .env.local의 R2 설정 확인
cat .env.local | grep R2
```

**출력 예시:**
```
VITE_R2_ACCOUNT_ID=3713eb9d93193241756e5001f913fac2
VITE_R2_ACCESS_KEY_ID=19279e8794cf33f5db74d2a8c8e24f5d
VITE_R2_SECRET_ACCESS_KEY=989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7
VITE_R2_BUCKET_NAME=one-some-storefront
VITE_R2_ENDPOINT=https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

### 1.2 API Token 생성 (필요시)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **My Profile** → **API Tokens** → **Create Token**
3. **Custom Token** 선택
4. 권한 설정:
   - **Account Resources**:
     - **Account**: `All Accounts`
     - **R2**: `Object.buckets:read, Object.buckets.contents:write`
5. **Create Token** 클릭 및 토큰 저장

---

## 🚀 Step 2: Supabase CLI 설치 및 로그인

### 2.1 Supabase CLI 설치

```bash
npm install -g supabase
# 또는 brew install supabase (macOS)
```

### 2.2 Supabase 로그인

```bash
supabase login
```

브라우저에서 자동 열림. Supabase 계정으로 로그인하고, 터미널로 돌아가서 확인.

### 2.3 프로젝트 연결

```bash
cd /Users/cpldxx/one-some-storefront

# 프로젝트 초기화 (이미 존재하면 스킵)
supabase init

# 프로젝트와 연결
supabase link --project-ref mdbjlufzfstekqgjceuq
```

프로젝트 선택 후 **Database Password** 입력.

---

## 🔑 Step 3: Edge Function 환경 변수 설정

### 3.1 Supabase 대시보시로 환경 변수 설정 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택: `mdbjlufzfstekqgjceuq`
3. **Settings** → **Edge Functions** (또는 **Functions**)
4. `upload-url` 함수 선택 (아직 없으면 배포 후 선택)
5. **Environment variables** 또는 **Secrets** 탭
6. 다음 변수 추가:

```
R2_ACCOUNT_ID = 3713eb9d93193241756e5001f913fac2
R2_ACCESS_KEY = 19279e8794cf33f5db74d2a8c8e24f5d
R2_SECRET_KEY = 989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7
R2_BUCKET_NAME = one-some-storefront
R2_ENDPOINT = https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

> **보안 팁**: Secrets 탭이 있으면 `R2_ACCESS_KEY`와 `R2_SECRET_KEY`는 Secrets에 저장하세요!

### 3.2 CLI로 환경 변수 설정 (선택사항)

`.env.local`의 변수를 사용하여:

```bash
supabase secrets set \
  R2_ACCOUNT_ID=3713eb9d93193241756e5001f913fac2 \
  R2_ACCESS_KEY=19279e8794cf33f5db74d2a8c8e24f5d \
  R2_SECRET_KEY=989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7 \
  R2_BUCKET_NAME=one-some-storefront \
  R2_ENDPOINT=https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

---

## 📤 Step 4: Edge Function 배포

### 4.1 함수 배포

```bash
supabase functions deploy upload-url
```

**성공 메시지:**
```
✓ Function upload-url deployed successfully!
Function URL: https://mdbjlufzfstekqgjceuq.supabase.co/functions/v1/upload-url
```

### 4.2 배포 확인

```bash
supabase functions list
```

**출력:**
```
Name       Status    Created At
upload-url deployed  2024-01-XX ...
```

---

## 🧪 Step 5: 테스트

### 5.1 Edge Function 직접 테스트

```bash
curl -X POST https://mdbjlufzfstekqgjceuq.supabase.co/functions/v1/upload-url \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test-image.jpg"}'
```

**성공 응답:**
```json
{
  "uploadUrl": "https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com/posts/..."
}
```

### 5.2 개발 서버에서 테스트

```bash
npm run dev
```

1. `http://localhost:5173/community` 접속
2. **Create Post** 버튼 클릭
3. 이미지 선택 → 태그 선택 → **Create Post** 클릭
4. 브라우저 개발자 도구 → **Network** 탭에서 요청 확인

---

## 🐛 문제 해결

### 문제 1: 여전히 500 에러

```
Preflight response is not successful. Status code: 500
```

**해결 방법:**
1. 환경 변수 모두 설정되었는지 확인
2. Supabase 대시보드에서 Edge Function Logs 확인:
   - Settings → Edge Functions → upload-url → Logs
3. 로그에서 `Missing R2 environment variables` 메시지 확인

### 문제 2: R2 업로드 권한 에러

```
Error: Access Denied
```

**해결 방법:**
1. Cloudflare R2 API Token의 권한 확인
   - `Object.buckets.contents:write` 권한 필요
2. 버킷 CORS 설정 확인:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

### 문제 3: CORS 에러

```
Access to fetch at ... blocked by CORS policy
```

**해결 방법:**
1. Edge Function의 CORS 헤더 확인 (이미 설정됨)
2. R2 버킷 CORS 정책 추가 (위 참고)

---

## ✅ 배포 체크리스트

- [ ] Cloudflare R2 API Token 확인 또는 생성
- [ ] Supabase CLI 설치 및 로그인
- [ ] 프로젝트와 CLI 연결 (`supabase link`)
- [ ] Edge Function 환경 변수 설정 (Supabase 대시보드 또는 CLI)
- [ ] 함수 배포 (`supabase functions deploy upload-url`)
- [ ] 배포 확인 (`supabase functions list`)
- [ ] curl로 함수 테스트
- [ ] 개발 서버에서 이미지 업로드 테스트

---

## 📚 참고 자료

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Cloudflare R2 API Docs](https://developers.cloudflare.com/r2/api/s3/api/)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)

---

## 🎯 다음 단계

1. 위 가이드를 따라 Edge Function 배포
2. 프로덕션 배포 전 모든 기능 로컬에서 테스트
3. 데이터베이스 마이그레이션 (기존 모의 데이터 → Supabase)
4. 사용자 인증 (Supabase Auth) 구현
