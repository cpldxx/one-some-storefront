#!/bin/bash

# 🚀 무신사 스냅 스타일 - Edge Function 배포 자동화 스크립트
# 사용법: bash deploy.sh

set -e

echo "🔄 Edge Function 배포 시작..."
echo ""

# Step 1: Supabase CLI 확인
echo "✅ Step 1: Supabase CLI 확인"
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI가 없습니다. 설치 중..."
    npm install -g supabase
    echo "✅ Supabase CLI 설치 완료"
else
    echo "✅ Supabase CLI 이미 설치됨"
fi
echo ""

# Step 2: 프로젝트 연결
echo "✅ Step 2: 프로젝트 연결"
cd "$(dirname "$0")"

if [ ! -d ".supabase" ]; then
    echo "처음 연결입니다. Supabase 로그인 필요..."
    supabase login
    supabase link --project-ref mdbjlufzfstekqgjceuq
    echo "✅ 프로젝트 연결 완료"
else
    echo "✅ 이미 연결됨"
fi
echo ""

# Step 3: 환경 변수 설정
echo "✅ Step 3: Edge Function 환경 변수 설정 중..."
supabase secrets set \
  R2_ACCOUNT_ID=3713eb9d93193241756e5001f913fac2 \
  R2_ACCESS_KEY=19279e8794cf33f5db74d2a8c8e24f5d \
  R2_SECRET_KEY=989c6b9e44421a619b87341db5189ce05fe40e65414062dcc8a91210193476e7 \
  R2_BUCKET_NAME=one-some-storefront \
  R2_ENDPOINT=https://3713eb9d93193241756e5001f913fac2.r2.cloudflarestorage.com

echo "✅ 환경 변수 설정 완료"
echo ""

# Step 4: 함수 배포
echo "✅ Step 4: Edge Function 배포 중..."
supabase functions deploy upload-url
echo "✅ 함수 배포 완료"
echo ""

# Step 5: 배포 확인
echo "✅ Step 5: 배포 확인"
echo ""
echo "배포된 함수 목록:"
supabase functions list
echo ""

echo "🎉 배포 완료!"
echo ""
echo "다음 단계:"
echo "1. 브라우저에서 http://localhost:5173/community 접속"
echo "2. Create Post 버튼 클릭"
echo "3. 이미지 선택하여 업로드 테스트"
echo ""
echo "개발 서버가 실행 중이지 않으면:"
echo "  npm run dev"
