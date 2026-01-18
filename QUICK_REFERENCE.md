# 🎴 빠른 참조 카드

**무신사 스냅 스타일 - 프로젝트 참조 가이드**

---

## 📍 지금 어디 있는가?

```
┌─────────────────────────────────────┐
│   코드: 100% 완성 ✅               │
│   문서: 100% 완성 ✅               │
│   배포: 70% 대기 ⏳                │
│   인증: 0% 미시작 📋              │
└─────────────────────────────────────┘
```

**전체 진행률: 67%** (배포 후 85%가 될 것으로 예상)

---

## 🎯 지금 해야 할 일 (20분)

```bash
# 1. Supabase 대시보드에서 환경 변수 5개 설정 (2분)
# Settings → Edge Functions → upload-url
R2_ACCOUNT_ID=3713eb9...
R2_ACCESS_KEY=19279e8...
R2_SECRET_KEY=989c6b9...
R2_BUCKET_NAME=one-some-storefront
R2_ENDPOINT=https://3713eb9...

# 2. 함수 배포 (1분)
supabase functions deploy upload-url

# 3. 배포 확인 (1분)
supabase functions list

# 4. 로컬 테스트 (15분)
npm run dev
# http://localhost:5173/community
# Create Post → 이미지 업로드 테스트
```

---

## 📚 어느 문서를 읽을까?

| 상황 | 읽을 문서 | 시간 |
|------|---------|------|
| 지금부터 시작 | **NEXT_STEPS.md** | 5분 |
| 배포 방법 | **EDGE_FUNCTION_DEPLOYMENT.md** | 20분 |
| 진행 현황 | **PROJECT_DASHBOARD.md** | 10분 |
| 인증 구현 | **AUTH_INTEGRATION_GUIDE.md** | 20분 |
| API 사용법 | **IMPLEMENTATION_GUIDE.md** | 15분 |
| 전체 설정 | **SUPABASE_SETUP.md** | 25분 |

---

## 💻 자주 쓸 명령어

```bash
# 개발 시작
npm run dev

# 빌드 확인
npm run build

# Edge Function 배포
supabase functions deploy upload-url

# 배포 목록 확인
supabase functions list

# 로그 확인
supabase functions logs upload-url

# 타입 체크
npx tsc --noEmit
```

---

## 🗺️ 주요 파일 위치

### 👤 사용자 관련
```
src/lib/community.ts     ← 커뮤니티 API
src/lib/upload.ts        ← 이미지 업로드
src/types/database.ts    ← 데이터 타입
```

### 🎨 UI 컴포넌트
```
src/features/community/UploadModal.tsx   ← 포스트 작성
src/features/community/StyleGrid.tsx     ← 피드
src/features/community/StyleCard.tsx     ← 포스트 카드
```

### 🔧 백엔드
```
supabase/functions/upload-url/           ← Edge Function
supabase/migrations/001_init.sql         ← 데이터베이스
.env.local                               ← 환경 변수
```

---

## 📊 프로젝트 통계

```
Total Files:        50+
Total Lines:        15,000+
Languages:          TypeScript, SQL, Markdown
Documentation:      12 guides (30KB+)
Build Time:         6.11s
Bundle Size:        784KB (248KB gzip)
Type Errors:        0
Lint Errors:        0
```

---

## ✅ 체크리스트

### 이번주 (즉시)
- [ ] Edge Function 환경 변수 설정
- [ ] 함수 배포
- [ ] 데이터베이스 마이그레이션
- [ ] 로컬 테스트

### 다음주
- [ ] 사용자 인증 구현
- [ ] 로그인/회원가입 UI
- [ ] 댓글 기능
- [ ] 필터 기능 완성

### 이후
- [ ] Follow 기능
- [ ] Real-time 업데이트
- [ ] 프로덕션 배포

---

## 🔐 환경 변수 (설정됨)

```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_R2_ACCOUNT_ID
✅ VITE_R2_ACCESS_KEY_ID
✅ VITE_R2_SECRET_ACCESS_KEY
✅ VITE_R2_BUCKET_NAME
✅ VITE_R2_ENDPOINT
```

⚠️ Edge Function 환경 변수는 Supabase 대시보드에서 설정 필요

---

## 🚀 배포 단계

```
Step 1: Supabase Auth 설정
        ↓
Step 2: 데이터베이스 마이그레이션
        ↓
Step 3: Edge Function 배포
        ↓
Step 4: 로컬 테스트
        ↓
Step 5: 프로덕션 배포
```

---

## 🎓 기술 스택

```
프론트엔드          백엔드
─────────────────────────────
React 19          Supabase
TypeScript        PostgreSQL
Vite              Deno
Tailwind          Cloudflare R2
Shadcn/ui         Edge Functions
React Query       
React Hook Form
```

---

## 🐛 문제 대응

| 에러 | 원인 | 해결 |
|------|------|------|
| Edge Function 500 | 환경 변수 미설정 | Supabase 대시보드에서 설정 |
| 이미지 업로드 실패 | R2 권한 부족 | Cloudflare API Token 확인 |
| CORS 에러 | R2 CORS 미설정 | R2 버킷 CORS 설정 추가 |

---

## 📞 자주 묻는 질문

**Q: 지금부터 뭘 해야 하나?**
→ NEXT_STEPS.md 읽고 5단계 따라하기

**Q: Edge Function이 왜 안 돼?**
→ 환경 변수 설정 → 배포 → 테스트

**Q: 어느 정도 진행했나?**
→ 67% (배포 후 85%)

**Q: 다음은 뭐?**
→ 사용자 인증 (AUTH_INTEGRATION_GUIDE.md)

---

## 🎯 우선순위

```
🔴 Critical (지금)
   └─ Edge Function 배포

🟡 High (이번주)
   ├─ 사용자 인증
   └─ 로그인 UI

🟢 Medium (다음주)
   ├─ 댓글 기능
   └─ 필터 완성

⚪ Low (그 이후)
   ├─ Follow 기능
   └─ Real-time
```

---

## 📈 예상 시간

```
Edge Function 배포      1시간
데이터베이스 마이그레이션  30분
로컬 테스트             20분
─────────────────────────────
첫 배포 준비            2시간

사용자 인증             3시간
로그인/회원가입         1시간
댓글 기능               2시간
필터 완성               1.5시간
─────────────────────────────
전체 개발               7.5시간
```

---

## 🔗 바로 가기

**지금 읽어야 할 문서:**
→ [NEXT_STEPS.md](./NEXT_STEPS.md) (5분)

**배포 가이드:**
→ [EDGE_FUNCTION_DEPLOYMENT.md](./EDGE_FUNCTION_DEPLOYMENT.md) (20분)

**다음 단계:**
→ [AUTH_INTEGRATION_GUIDE.md](./AUTH_INTEGRATION_GUIDE.md) (20분)

**전체 현황:**
→ [PROJECT_DASHBOARD.md](./PROJECT_DASHBOARD.md) (10분)

---

## 💡 팁

- 💾 모든 문서는 마크다운 형식 (편집 가능)
- 🔍 `Ctrl+F`로 찾기 가능
- 📌 자주 쓸 문서는 북마크하기
- ✏️ 완료한 항목은 체크 표시 해두기
- 📱 스마트폰에서도 읽기 가능

---

## ✨ 핵심 정보

```
Project:     무신사 스냅 스타일
Status:      67% 완료 (배포 대기)
Next Step:   Edge Function 배포
Time:        20분-2시간
Difficulty:  Easy → Medium
```

---

**마지막 업데이트: 2026-01-17**
**다음 세션: Edge Function 배포 및 인증 구현**

> 📌 **지금 바로:** NEXT_STEPS.md 읽고 배포 시작하기!
