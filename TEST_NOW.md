# 🧪 지금 바로 테스트하세요!

**Edge Function이 배포되었습니다! 이제 이미지 업로드가 작동할 것입니다.**

---

## 🚀 테스트 (2분)

### Step 1: 브라우저 새로고침
```
현재 열려있는 브라우저에서
F5 또는 Cmd+R (맥)
```

### Step 2: Community 페이지 접속
```
http://localhost:5173/community
```

### Step 3: Create Post 버튼 클릭
```
우측 하단의 파란 [+] 버튼 또는
우측 상단의 [Create Post] 버튼
```

### Step 4: 이미지 선택
```
이미지 업로드 영역 클릭
사진 선택 (JPG, PNG 등)
```

### Step 5: 설명 입력 (선택사항)
```
"오늘의 패션" 같은 설명 입력
```

### Step 6: 태그 선택 (선택사항)
```
Season, Style, Brand, Category 선택
```

### Step 7: Create Post 클릭
```
우측 하단의 [Create Post] 버튼 클릭
```

---

## ✅ 성공 표지

다음 중 하나라도 보이면 **성공!** 🎉

```
✅ "Post created successfully" 메시지
✅ 피드에 새 포스트 나타남
✅ 좋아요, 댓글 수 표시됨
✅ 브라우저 Console에 에러 없음
```

---

## ❌ 문제가 나면

### 에러 메시지가 보이면

1. **브라우저 Console 열기**
   ```
   F12 또는 Cmd+Option+I (맥)
   ```

2. **Console 탭 클릭**
   ```
   Red 에러 메시지 확인
   에러 메시지 복사
   ```

3. **Edge Function 로그 확인**
   ```bash
   npx supabase functions logs upload-url
   ```

4. **Network 탭 확인**
   ```
   DevTools → Network 탭
   upload-url 요청 찾기
   상태 코드 확인 (200 = 성공)
   ```

### 여전히 500 에러면

```bash
# Edge Function 재배포
npx supabase functions deploy upload-url --no-verify-jwt

# 브라우저 캐시 삭제 후 새로고침
Cmd+Shift+Delete (맥)
```

---

## 📊 예상 동작

```
1. Create Post 버튼 클릭
   ↓
2. 모달 팝업 (사진 선택 가능)
   ↓
3. 사진 선택 → Create Post 클릭
   ↓
4. [업로드 중...] 표시 (몇 초)
   ↓
5. ✅ "Post created successfully"
   ↓
6. 모달 닫힘
   ↓
7. 피드에 새 포스트 나타남 (위)
```

---

## 📱 다른 테스트

### 여러 이미지 업로드
```
1. Create Post → 이미지 선택
2. 다시 Create Post 클릭 (다른 이미지)
3. 반복하여 여러 포스트 생성
```

### 큰 이미지 테스트
```
1. 큰 해상도 사진 선택 (10MB 이상)
2. 자동으로 1MB, 1080px로 압축됨
3. 업로드 성공하는지 확인
```

### 다양한 형식 테스트
```
JPG, PNG, WebP, GIF 등
모두 정상 작동해야 함
```

---

## 💡 팁

### 개발자 도구에서 Network 탭 보기
```
1. F12 열기
2. Network 탭
3. Create Post 시도
4. upload-url 요청 클릭
5. Response 탭에서 응답 확인
   {
     "uploadUrl": "https://...",
     "publicUrl": "https://...",
     "key": "123456_filename.jpg"
   }
```

### Console에서 에러 확인
```
1. F12 열기
2. Console 탭
3. 빨간 에러 메시지 확인
4. 스택 트레이스 읽기
```

---

## 🎯 성공하면 알려주세요!

이미지가 업로드되고 새 포스트가 피드에 나타나면:

✅ **이제 인증 구현으로 넘어갈 수 있습니다!**

다음 단계:
- [AUTH_INTEGRATION_GUIDE.md](./AUTH_INTEGRATION_GUIDE.md) 읽기
- 사용자 인증 구현
- 로그인/회원가입 페이지

---

**지금 바로 테스트하세요!** 🚀
