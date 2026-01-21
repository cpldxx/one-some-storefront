import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

/**
 * Supabase Edge Function에서 R2 Presigned URL 및 Public URL 요청
 */
async function getPresignedUrl(fileName: string, fileType: string = 'image/jpeg'): Promise<{ uploadUrl: string; publicUrl: string }> {
  const response = await supabase.functions.invoke('upload-url', {
    body: { fileName, fileType },
  });

  if (response.error) {
    throw new Error(`Failed to get presigned URL: ${response.error.message}`);
  }

  return {
    uploadUrl: response.data.uploadUrl,
    publicUrl: response.data.publicUrl,
  };
}

/**
 * 이미지 압축
 */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1080,
    useWebWorker: true,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // 압축 실패 시 원본 반환
  }
}

/**
 * 파일명을 안전한 영문으로 변환
 */
function sanitizeFileName(originalName: string): string {
  // 확장자 추출
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  // 타임스탬프 + 랜덤 문자열로 새 파일명 생성
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${timestamp}_${randomStr}.${extension}`;
}

/**
 * 이미지 파일을 R2에 업로드
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지의 URL
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // 1. 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // 2. 이미지 압축
    const compressedFile = await compressImage(file);

    // 3. 파일명을 안전한 영문으로 변환 (한글 제거)
    const safeFileName = sanitizeFileName(file.name);
    const { uploadUrl, publicUrl } = await getPresignedUrl(safeFileName, compressedFile.type);

    // 4. R2에 업로드 (PUT)
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': compressedFile.type,
      },
      body: compressedFile,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status ${uploadResponse.status}`);
    }

    // 5. 공개 URL 반환 (Edge Function에서 반환된 URL 사용)
    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * 여러 이미지 업로드 (향후 기능)
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file)));
}
