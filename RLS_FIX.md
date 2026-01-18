# 🔐 RLS 정책 문제 해결 가이드

**문제:** `401 Unauthorized` 에러 - 게시물 저장 실패  
**원인:** Row Level Security (RLS) 정책이 인증되지 않은 사용자의 삽입을 거부  
**해결:** 임시로 RLS 정책 비활성화 (테스트용)

---

## 🔧 해결 방법 (2가지)

### 방법 1️⃣: Supabase 대시보드에서 비활성화 (권장, 5분)

1. **Supabase 대시보드 접속**
   ```
   https://app.supabase.com
   프로젝트: mdbjlufzfstekqgjceuq
   ```

2. **SQL Editor 열기**
   - 왼쪽 메뉴 → **SQL Editor**
   - **New Query** 클릭

3. **아래 SQL 실행**
   ```sql
   -- 테스트용으로 posts 테이블의 RLS 임시 비활성화
   ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
   
   -- 또는 더 안전하게, INSERT 정책만 수정
   DROP POLICY "Users can create posts" ON posts;
   CREATE POLICY "Posts can be created by anyone (testing)" ON posts
     FOR INSERT WITH CHECK (true);
   ```

4. **Run** 클릭

### 방법 2️⃣: 명령어로 실행

```bash
# Supabase CLI가 설치되어 있다면
npx supabase db push

# 또는 직접 쿼리 실행
npx supabase query "
  ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
"
```

---

## ✅ 완료 후 테스트

1. 브라우저 새로고침 (F5)
2. http://localhost:8082/community 접속 (또는 현재 포트)
3. Create Post 클릭
4. 이미지 선택 & 업로드

**성공 표지:**
- ✅ "Post created successfully" 메시지
- ✅ 피드에 새 포스트 나타남
- ✅ Console에 에러 없음

---

## ⚠️ 주의사항

**RLS 비활성화는 테스트용일 뿐입니다!**

프로덕션 배포 전에:

1. **사용자 인증 구현** (AUTH_INTEGRATION_GUIDE.md 참고)
   - 실제 로그인/회원가입 기능

2. **RLS 정책 재활성화**
   ```sql
   ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
   ```

3. **프로필 테이블도 처리**
   ```sql
   -- 테스트용 프로필 생성
   INSERT INTO profiles (id, email, username) 
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     'test@example.com',
     'testuser'
   )
   ON CONFLICT DO NOTHING;
   ```

---

## 📊 현재 상황

| 항목 | 상태 |
|------|------|
| 이미지 업로드 (R2) | ✅ 성공 |
| Edge Function | ✅ 배포됨 |
| 데이터베이스 연결 | ⏳ RLS 문제 |
| RLS 정책 | ⏳ 테스트용 비활성화 필요 |
| 사용자 인증 | 📋 미구현 (다음주) |

---

## 🎯 다음 단계

1. ✅ RLS 정책 비활성화
2. ✅ 게시물 업로드 테스트
3. 📋 사용자 인증 구현 (AUTH_INTEGRATION_GUIDE.md)
4. 📋 RLS 정책 재활성화
5. 📋 프로덕션 배포

---

## 💡 RLS란?

**Row Level Security (RLS)** - 데이터베이스 행 단위로 접근 제어하는 보안 정책

```sql
-- 예: 사용자는 자신의 게시물만 수정할 수 있음
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
  -- auth.uid(): 로그인한 사용자 ID
  -- user_id: 게시물 소유자 ID
```

테스트 단계에서는 비활성화하고, 프로덕션에서는 반드시 활성화해야 합니다!

---

**이제 대시보드에서 SQL을 실행하세요!** 🚀
