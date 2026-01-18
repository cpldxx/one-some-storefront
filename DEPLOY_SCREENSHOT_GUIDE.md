# 📸 Supabase 대시보드에서 Edge Function 배포 - 스크린샷 가이드

**현재 상황:** Edge Function이 배포되지 않아 500 에러 발생  
**해결 방법:** Supabase 대시보드 UI에서 5분 안에 배포  
**예상 결과:** 이미지 업로드가 정상 작동

---

## 🚀 5단계로 배포하기

### Step 1️⃣: Supabase 대시보드 접속

```
URL을 복사하여 브라우저에 붙여넣기:
https://app.supabase.com/project/mdbjlufzfstekqgjceuq/functions
```

또는:
1. https://app.supabase.com 접속
2. 프로젝트: `mdbjlufzfstekqgjceuq` 선택
3. 왼쪽 메뉴: **Settings** → **Edge Functions**
4. 또는 **Functions** 메뉴 (위치는 Supabase 버전에 따라 다름)

---

### Step 2️⃣: `upload-url` 함수 확인/생성

**보이는 화면:**
- Function list 또는 빈 Functions 페이지

**해야 할 일:**

#### A) 함수가 이미 있으면:
```
목록에서 "upload-url" 클릭
```

#### B) 함수가 없으면:
```
"Create a new function" 또는 "New Function" 버튼 클릭
↓
Name: upload-url 입력
↓
"Create function" 클릭
```

---

### Step 3️⃣: 함수 코드 붙여넣기 (대시보드 에디터)

**보이는 화면:**
```
Code Editor (왼쪽)
Environment Variables (오른쪽 또는 아래)
```

**해야 할 일:**

1. **대시보드의 코드 에디터에서:**
   - 모든 코드 선택 (Cmd+A)
   - 삭제
   - 아래 코드 복사하여 붙여넣기:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.400.0";
import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.400.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return new Response(
        JSON.stringify({ error: "fileName is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const r2AccountId = Deno.env.get("R2_ACCOUNT_ID");
    const r2AccessKey = Deno.env.get("R2_ACCESS_KEY");
    const r2SecretKey = Deno.env.get("R2_SECRET_KEY");
    const r2BucketName = Deno.env.get("R2_BUCKET_NAME");
    const r2Endpoint = Deno.env.get("R2_ENDPOINT");

    if (
      !r2AccountId ||
      !r2AccessKey ||
      !r2SecretKey ||
      !r2BucketName ||
      !r2Endpoint
    ) {
      console.error("Missing R2 environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const s3Client = new S3Client({
      region: "auto",
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
      endpoint: r2Endpoint,
    });

    const objectKey = `posts/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: objectKey,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return new Response(JSON.stringify({ uploadUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

2. **저장:**
   - Cmd+S 또는 **Save** 버튼 클릭

---

### Step 4️⃣: 환경 변수 추가 (중요!)

**보이는 화면:**
```
Environment Variables 섹션
(함수 에디터 오른쪽 또는 Settings 탭)
```

**해야 할 일:**

각 변수를 **하나씩** 추가합니다:

#### Variable 1:
```
Name:  R2_ACCOUNT_ID
Value: 3713eb9d93193241756e5001f913fac2

[Add Variable] 또는 [Save] 클릭
```

#### Variable 2:
```
Name:  R2_ACCESS_KEY
Value: 19279e8794cf33f5db74d2a8c8e24f5d

[Add Variable] 또는 [Save] 클릭
```

#### Variable 3:
```
Name:  R2_SECRET_KEY
Value: 989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7

[Add Variable] 또는 [Save] 클릭
```

#### Variable 4:
```
Name:  R2_BUCKET_NAME
Value: one-some-storefront

[Add Variable] 또는 [Save] 클릭
```

#### Variable 5:
```
Name:  R2_ENDPOINT
Value: https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com

[Add Variable] 또는 [Save] 클릭
```

**⚠️ 중요:**
- 값을 정확히 복사-붙여넣기 (공백 주의)
- 각 변수마다 저장 버튼 클릭
- 모든 5개 변수가 추가될 때까지 반복

---

### Step 5️⃣: 함수 배포

**보이는 화면:**
```
Function page 상단
```

**해야 할 일:**

1. **Code 에디터 저장:**
   - Cmd+S 또는 **Save** 클릭

2. **배포 버튼 찾기:**
   - **Deploy** 버튼 클릭
   - 또는 **Save & Deploy** 버튼 클릭

3. **배포 확인:**
   ```
   ✅ "Function deployed successfully" 메시지
   또는
   ✅ Function status: "Deployed" (초록색)
   또는
   ✅ URL 표시: https://mdbjlufzfstekqgjceuq.supabase.co/functions/v1/upload-url
   ```

---

## 🧪 로컬에서 즉시 테스트

**배포 완료 후:**

1. **브라우저 새로고침**
   ```
   Cmd+R (또는 Cmd+Shift+R 강제 새로고침)
   ```

2. **앱에서 테스트**
   ```
   http://localhost:5173/community 접속
   ↓
   "Create Post" 버튼 클릭
   ↓
   이미지 선택 (컴퓨터의 이미지 파일)
   ↓
   설명 입력
   ↓
   태그 선택 (Season, Style 등)
   ↓
   "Create Post" 버튼 클릭
   ```

3. **성공 표시:**
   ```
   ✅ "Uploading..." 진행률 표시
   ✅ 수초 후 완료 메시지
   ✅ 커뮤니티 피드에 새 포스트 나타남
   ✅ 브라우저 콘솔에 에러 없음
   ```

---

## ❌ 문제 발생 시

### 여전히 500 에러?

**확인할 사항:**

1. **환경 변수가 모두 저장되었는가?**
   ```
   Supabase 대시보드 → Functions → upload-url → Settings
   ↓
   5개 변수가 모두 보이는지 확인
   (비어있으면 다시 추가)
   ```

2. **함수가 배포되었는가?**
   ```
   Function status: ✅ Deployed (초록색)
   ```

3. **코드에 오류가 없는가?**
   ```
   Supabase 콘솔 로그 확인:
   Supabase 대시보드 → Functions → upload-url → Logs
   ```

### R2 업로드 실패?

**확인할 사항:**

1. **Cloudflare R2 API Token이 올바른가?**
   ```
   .env.local 확인:
   VITE_R2_ACCESS_KEY_ID=...
   VITE_R2_SECRET_ACCESS_KEY=...
   ```

2. **R2 버킷이 존재하는가?**
   ```
   Cloudflare 대시보드 → R2 → Buckets
   "one-some-storefront" 버킷 확인
   ```

3. **R2 CORS 설정**
   ```
   Cloudflare 대시보드 → R2 → one-some-storefront
   → Settings → CORS
   
   다음 정책 추가:
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

---

## 📱 체크리스트

```
[ ] Supabase 대시보드 로그인
[ ] Functions 페이지로 이동
[ ] upload-url 함수 생성/선택
[ ] 코드 붙여넣기 및 저장
[ ] R2_ACCOUNT_ID 변수 추가
[ ] R2_ACCESS_KEY 변수 추가
[ ] R2_SECRET_KEY 변수 추가
[ ] R2_BUCKET_NAME 변수 추가
[ ] R2_ENDPOINT 변수 추가
[ ] 함수 배포
[ ] 배포 확인 (초록색 체크)
[ ] 브라우저 새로고침
[ ] 로컬 앱에서 이미지 업로드 테스트
[ ] 피드에 포스트 나타남 ✅
```

---

## ✨ 완료!

이미지 업로드가 작동합니다! 🎉

**다음 단계:**
1. 📚 `AUTH_INTEGRATION_GUIDE.md` 읽기 (사용자 인증)
2. 💻 다음주 개발 시작

---

**소요 시간:** 5-10분  
**난이도:** 매우 쉬움 (복사-붙여넣기)

**문제 발생 시:** 이 문서의 "문제 발생 시" 섹션 참고 👆
