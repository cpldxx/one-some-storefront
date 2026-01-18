# ✅ 500 에러 해결 완료 가이드

**현재:** Edge Function이 500 에러를 반환함  
**원인:** 환경 변수가 Supabase Edge Function에 설정되지 않음  
**해결:** Supabase 대시보드에서 5개 값을 입력하기만 하면 됨  
**소요 시간:** 3분

---

## 📄 어느 문서를 읽을까?

### 🔴 **지금 바로 하려면 (가장 빠름)**
→ **[COPY_PASTE_NOW.md](./COPY_PASTE_NOW.md)** (1분 읽기)
- 5개 값만 복사해서 붙여넣으면 됨
- 마우스 클릭만 하면 완료

### 🟡 **자세한 지침이 필요하면**
→ **[DASHBOARD_ONLY_3MIN.md](./DASHBOARD_ONLY_3MIN.md)** (3분 가이드)
- 대시보드에서만 작업 (CLI 불필요)
- 스크린샷 같은 설명
- 주의사항 포함

### 🟢 **완전한 배경 설명이 필요하면**
→ **[FIX_500_ERROR_NOW.md](./FIX_500_ERROR_NOW.md)** (5분 상세 가이드)
- 문제 설명
- 해결 방법 상세
- 문제 해결 팁

### 💻 **CLI로 하려면**
→ **[EDGE_FUNCTION_DEPLOYMENT.md](./EDGE_FUNCTION_DEPLOYMENT.md)** (20분)
- Supabase CLI 사용
- `bash deploy.sh` 스크립트 사용 가능

---

## 🎯 추천: 가장 빠른 방법 (3분)

```
1. COPY_PASTE_NOW.md 열기
2. 5개 값 복사
3. Supabase 대시보드 → Settings → Edge Functions → upload-url
4. Secrets 탭에서 5개 값 붙여넣기
5. [Save] 클릭
6. 브라우저 새로고침 (F5)
7. http://localhost:5173/community 에서 테스트
```

---

## 📋 체크리스트

```
준비 상태
├─ [✓] 코드 완성 (UploadModal.tsx 수정됨)
├─ [✓] .env.local 설정 (7개 변수)
├─ [✓] Edge Function 코드 작성됨
└─ [ ] Edge Function 환경 변수 설정 ← 지금 하기!

배포 상태
├─ [ ] R2_ACCOUNT_ID 설정
├─ [ ] R2_ACCESS_KEY 설정
├─ [ ] R2_SECRET_KEY 설정
├─ [ ] R2_BUCKET_NAME 설정
└─ [ ] R2_ENDPOINT 설정

테스트
└─ [ ] http://localhost:5173/community 에서 이미지 업로드 테스트
```

---

## 🔗 빠른 링크

| 문서 | 용도 | 소요 시간 |
|------|------|---------|
| **[COPY_PASTE_NOW.md](./COPY_PASTE_NOW.md)** | 값만 복사하기 | 1분 |
| **[DASHBOARD_ONLY_3MIN.md](./DASHBOARD_ONLY_3MIN.md)** | 대시보드 가이드 | 3분 |
| **[FIX_500_ERROR_NOW.md](./FIX_500_ERROR_NOW.md)** | 상세 설명 | 5분 |
| **[EDGE_FUNCTION_DEPLOYMENT.md](./EDGE_FUNCTION_DEPLOYMENT.md)** | CLI 방법 | 20분 |

---

## 💡 팁

### ✨ 가장 간단한 방법:
1. COPY_PASTE_NOW.md 읽기
2. 5개 값 복사
3. Supabase 대시보드에 붙여넣기
4. [Save] 클릭
5. 끝!

### 🔒 보안 주의:
- `R2_SECRET_KEY`는 꼭 **Secrets** 탭에 입력하세요
- 다른 값들은 일반 탭에 입력 가능

### 🧪 테스트:
```bash
# 개발 서버가 실행 중이어야 함
npm run dev

# 브라우저에서
http://localhost:5173/community
# Create Post 버튼 클릭
# 이미지 선택 후 업로드 테스트
```

---

## ✅ 성공 표지

배포가 성공하면:
- ✅ 브라우저 Console에 에러 없음
- ✅ 이미지 업로드 시 진행률 표시
- ✅ "Post created successfully" 메시지
- ✅ 피드에 새 포스트 나타남

---

## 🚀 완료 후 다음 단계

1. ✅ Edge Function 배포 완료
2. 📋 데이터베이스 마이그레이션 (SQL 실행)
3. 🔐 사용자 인증 구현
4. 📝 댓글, Follow 기능 추가

→ [NEXT_STEPS.md](./NEXT_STEPS.md)에서 계속 진행

---

**지금 바로:** [COPY_PASTE_NOW.md](./COPY_PASTE_NOW.md) 열기! 🚀
