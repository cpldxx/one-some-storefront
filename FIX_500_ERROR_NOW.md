# 🚨 URGENT: Edge Function 500 Error 해결 (지금 바로)

**에러:** `Preflight response is not successful. Status code: 500`

**원인:** Edge Function이 배포되지 않았거나 환경 변수가 설정되지 않음

**해결 시간:** 5분

---

## ⚡ 지금 바로 하기 (5분)

### Step 1: Supabase 대시보드 접속 (1분)

```
https://app.supabase.com
프로젝트 선택: mdbjlufzfstekqgjceuq
```

---

### Step 2: 환경 변수 확인 (2분)

**방법:**
1. 좌측 메뉴에서 **Settings** 클릭
2. **Edge Functions** 또는 **Functions** 탭 선택
3. `upload-url` 함수를 찾아 클릭
4. **Environment variables** 또는 **Secrets** 탭 클릭

**설정할 5개 변수:**

```
이름: R2_ACCOUNT_ID
값: 3713eb9d93193241756e5001f913fac2

이름: R2_ACCESS_KEY
값: 19279e8794cf33f5db74d2a8c8e24f5d

이름: R2_SECRET_KEY
값: 989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7

이름: R2_BUCKET_NAME
값: one-some-storefront

이름: R2_ENDPOINT
값: https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

**팁:** `R2_SECRET_KEY`는 **Secrets** 탭에 저장하세요 (더 안전함)

---

### Step 3: 함수 배포 (2분)

터미널에서:

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 연결
cd /Users/cpldxx/one-some-storefront
supabase link --project-ref mdbjlufzfstekqgjceuq

# 4. 환경 변수로 배포 (옵션 A: CLI 이용)
supabase secrets set \
  R2_ACCOUNT_ID=3713eb9d93193241756e5001f913fac2 \
  R2_ACCESS_KEY=19279e8794cf33f5db74d2a8c8e24f5d \
  R2_SECRET_KEY=989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7 \
  R2_BUCKET_NAME=one-some-storefront \
  R2_ENDPOINT=https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com

# 5. 함수 배포
supabase functions deploy upload-url

# 6. 배포 확인
supabase functions list
```

**또는 Option B: 대시보드에서만 (더 쉬움)**
- Supabase 대시보드에서 환경 변수 5개 설정 후
- 자동으로 함수가 배포됩니다

---

## 🧪 배포 확인 (1분)

### CLI로 확인:
```bash
supabase functions list
```

**성공 메시지:**
```
Name       Status    Created At
upload-url deployed  2026-01-18 ...
```

### 또는 대시보드에서:
- Settings → Edge Functions → upload-url
- Status가 **deployed** 또는 **active**로 표시됨

---

## ✅ 테스트 (2분)

1. 브라우저에서 **F5** 눌러 새로고침
2. http://localhost:5173/community 접속
3. **Create Post** 클릭
4. 이미지 선택
5. **Create Post** 제출

**성공 표지:**
- 이미지가 업로드됨
- "Post created successfully" 메시지
- 피드에 새 포스트 나타남

---

## 🐛 여전히 500 에러가 나면

### 원인 1: 환경 변수 미설정
```
확인: Supabase 대시보드 → Settings → Edge Functions
→ upload-url → Environment variables
→ 5개 변수 모두 있는지 확인
```

### 원인 2: 함수 미배포
```bash
# 재배포
supabase functions deploy upload-url
```

### 원인 3: 로컬 캐시 문제
```bash
# 캐시 삭제 후 재시작
npm run dev
# Ctrl+C로 종료
npm run dev  # 다시 시작
```

### 원인 4: 포트 충돌
```bash
# 다른 포트에서 실행
npm run dev -- --port 5174
```

---

## 🔗 다음 단계

배포 성공 후:
1. ✅ 로컬 이미지 업로드 테스트 완료
2. 📋 데이터베이스 마이그레이션 (SQL 실행)
3. 🔐 사용자 인증 구현
4. 📝 댓글, Follow 기능

---

## 💡 빠른 팁

**Mac에서 Supabase CLI가 안 깔리면:**
```bash
# brew 사용
brew install supabase/tap/supabase

# 또는 npm 사용 (권장)
npm install -g supabase
```

**프로젝트에 바로 진입:**
```bash
cd /Users/cpldxx/one-some-storefront
supabase link
```

---

## 📞 더 도움이 필요하면

- **배포 가이드:** EDGE_FUNCTION_DEPLOYMENT.md
- **환경 변수:** .env.local 참고
- **다음 단계:** NEXT_STEPS.md

---

**모두 완료되면 이 파일을 삭제해도 괜찮습니다!** ✅
