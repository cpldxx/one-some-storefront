# One Some - 프리미엄 스트릿 패션 쇼핑몰

현대적이고 미니멀한 디자인의 온라인 스토어프론트입니다.

## 🎯 프로젝트 개요

One Some은 Shopify 백엔드를 활용한 React 기반의 프리미엄 패션 쇼핑몰입니다.

## 🚀 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:8080`으로 접속하세요.

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📁 프로젝트 구조

```
src/
  ├── components/      # 재사용 가능한 UI 컴포넌트
  ├── features/        # 기능별 컴포넌트
  │   ├── cart/       # 장바구니
  │   ├── landing/    # 랜딩 페이지 섹션
  │   ├── layout/     # 레이아웃
  │   └── products/   # 상품 관련
  ├── hooks/          # 커스텀 훅
  ├── lib/            # 유틸리티 및 API
  ├── pages/          # 페이지 컴포넌트
  └── stores/         # 상태 관리
```

## 🛠️ 기술 스택

- **프론트엔드**: React 18, TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **번들러**: Vite
- **상태 관리**: Zustand
- **애니메이션**: Framer Motion
- **캐러셀**: Embla Carousel
- **API**: Shopify Storefront API (GraphQL)

## 📦 주요 기능

- ✨ 부드러운 스크롤 애니메이션
- 🎠 자동 재생 프로모션 캐러셀 (3초마다 전환)
- 🛒 동적 장바구니 관리
- ❤️ 찜하기 기능
- 🔍 상품 검색
- 📱 반응형 디자인

## 🔗 Shopify 연동

현재 `one-some-storefront-592cz.myshopify.com`의 Shopify Storefront API와 연동되어 있습니다.

API 설정은 `src/lib/shopify.ts`에서 관리됩니다.

## 💻 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 린팅 검사
npm run lint

# 테스트 실행
npm run test

# 테스트 감시 모드
npm run test:watch
```

## 📝 라이선스

MIT

## 👨‍💻 개발자

One Some Team
