import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // 1. CORS Preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. 환경변수 확인
    const endpoint = Deno.env.get("R2_ENDPOINT");
    const accessKeyId = Deno.env.get("R2_ACCESS_KEY");
    const secretAccessKey = Deno.env.get("R2_SECRET_KEY");
    const bucketName = Deno.env.get("R2_BUCKET_NAME");

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Missing R2 Environment Variables");
    }

    // 3. S3 클라이언트 초기화
    const S3 = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // 4. 요청 데이터 파싱
    const { fileName, fileType } = await req.json();

    // 5. 파일명 중복 방지
    const uniqueFileName = `${Date.now()}_${fileName.replace(/\s/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: fileType,
    });

    // 6. 업로드 URL 생성 (10분 유효)
    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 600 });

    // 7. publicUrl 생성 (endpoint 끝에 슬래시 제거 후 조합)
    const publicEndpoint = endpoint.replace(/\/$/, "");
    
    return new Response(
      JSON.stringify({
        uploadUrl,
        key: uniqueFileName,
        publicUrl: `${publicEndpoint}/${bucketName}/${uniqueFileName}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Server Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
