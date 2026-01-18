# 🚀 URGENT: Edge Function 배포 - 3단계 (5분)

**문제:** Edge Function이 배포되지 않아 500 에러 발생
**해결:** Supabase 대시보드에서 직접 배포

---

## ✅ Step 1: Supabase 대시보드 접속 (30초)

```
URL: https://app.supabase.com
Project: mdbjlufzfstekqgjceuq
```

1. 브라우저에서 위 URL 접속
2. 프로젝트 선택: `mdbjlufzfstekqgjceuq`

---

## ✅ Step 2: Edge Function 환경 변수 설정 (2분)

### 2.1 왼쪽 메뉴에서 이동
```
Settings → Edge Functions (또는 Functions)
```

또는 다이렉트 URL:
```
https://app.supabase.com/project/mdbjlufzfstekqgjceuq/functions
```

### 2.2 `upload-url` 함수를 찾거나 생성

함수가 없으면:
1. **Create a new function** 클릭
2. Name: `upload-url`
3. 아래 코드 복사하여 붙여넣기

### 2.3 함수 코드 (이미 준비됨)

**파일:** `supabase/functions/upload-url/index.ts`

코드가 있으니 복사하거나, Supabase 대시보드의 editor에서 수정:

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

### 2.4 환경 변수 추가

**Supabase 대시보드에서:**

함수 오른쪽 상단 → **Settings** 또는 **Environment Variables** 탭

**5개 변수 추가:**

```
R2_ACCOUNT_ID = 3713eb9d93193241756e5001f913fac2

R2_ACCESS_KEY = 19279e8794cf33f5db74d2a8c8e24f5d

R2_SECRET_KEY = 989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7

R2_BUCKET_NAME = one-some-storefront

R2_ENDPOINT = https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com
```

**⚠️ 중요:** 각 변수를 **Enter** 키로 확인한 후 다음 변수 입력

---

## ✅ Step 3: 배포 확인 (30초)

### 3.1 Function 저장

대시보드에서 **Save** 또는 **Deploy** 버튼 클릭

### 3.2 배포 상태 확인

```
Functions 목록에서 upload-url 옆에 ✅ (초록색) 표시가 나타남
```

또는 함수 URL이 표시됨:
```
https://mdbjlufzfstekqgjceuq.supabase.co/functions/v1/upload-url
```

---

## ✅ Step 4: 로컬 테스트 (1분)

1. 브라우저에서 애플리케이션 새로고침 (Cmd+R)
2. Community 페이지 접속
3. **Create Post** 버튼 클릭
4. 이미지 선택 → 태그 선택 → **Create Post** 클릭

**성공 표시:**
- 로딩 애니메이션 나타남
- 업로드 완료 후 피드에 포스트 추가됨
- 콘솔에 에러 없음

---

## 🐛 문제 해결

### 여전히 500 에러?

**원인:** 환경 변수가 제대로 저장되지 않음

**해결:**
1. Supabase 대시보드 새로고침 (Cmd+R)
2. 함수 설정으로 이동
3. 환경 변수 다시 확인 (값이 비어있을 수 있음)
4. 각 변수를 다시 입력하고 저장

### CORS 에러?

**원인:** R2 CORS 설정 필요

**해결:**
1. Cloudflare 대시보드 → R2
2. 버킷 선택: `one-some-storefront`
3. **Settings** → **CORS**
4. 다음 정책 추가:

```json
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

## 📱 완료 확인 체크리스트

```
[ ] Supabase 대시보드 접속
[ ] upload-url 함수 찾거나 생성
[ ] 코드 저장/배포
[ ] 5개 환경 변수 설정
[ ] 변수 저장 확인
[ ] 로컬 앱 새로고침
[ ] 이미지 업로드 테스트
[ ] 피드에 포스트 나타남 ✨
```

---

## ⏱️ 예상 소요 시간

```
대시보드 접속:      1분
코드 확인/수정:     1분
환경 변수 설정:     2분
배포 확인:          30초
로컬 테스트:        1분
─────────────────────
총: 5-10분
```

---

## 🎯 다음

배포 완료 후:
1. ✅ 로컬에서 이미지 업로드 작동 확인
2. 📚 다음 단계: `AUTH_INTEGRATION_GUIDE.md` 읽기 (사용자 인증)

---

**지금 바로:** Supabase 대시보드에서 함수 배포하기! 🚀
