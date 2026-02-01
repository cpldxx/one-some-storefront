import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const HF_API_TOKEN = Deno.env.get('HF_API_TOKEN');
const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. CORS 처리 (브라우저 접근 허용)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. [안전 장치 추가] 요청 방식 확인
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: "이 주소는 브라우저에서 직접 접속할 수 없습니다. 앱의 버튼을 눌러주세요!" }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. [안전 장치 추가] 빈 내용물 확인
    let lat, lon, profile;
    try {
      if (!req.body) throw new Error();
      const body = await req.json();
      lat = body.lat;
      lon = body.lon;
      profile = body.profile;
      if (lat === undefined || lon === undefined || !profile) throw new Error();
    } catch {
      return new Response(
        JSON.stringify({ error: "요청 내용(Body)이 비어있거나 필수 정보가 없습니다. 앱에서 다시 시도해주세요." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`요청 도착! 위치: ${lat}, ${lon} / 유저: ${profile?.username}`);

    // 4. 날씨 조회
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    if (!weatherRes.ok) {
      const errText = await weatherRes.text();
      throw new Error(`날씨 API 에러: ${errText}`);
    }
    const wData = await weatherRes.json();
    const temp = wData.main.temp;
    const weatherMain = wData.weather[0].main;

    // 5. LLM (Mistral) 호출
    const systemPrompt = `
      You are a fashion stylist.
      User Profile: ${JSON.stringify(profile)}
      Current Weather: ${weatherMain}, ${temp}°C.
      Task: Return a JSON object with:
      1. "reasoning": A friendly Korean explanation (2 sentences).
      2. "image_prompt": A detailed English prompt for image generation (photorealistic, street snap).
      Output ONLY JSON. Example: {"reasoning": "...", "image_prompt": "..."}
    `;

    const llmRes = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        headers: { Authorization: `Bearer ${HF_API_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ 
          inputs: systemPrompt,
          parameters: { max_new_tokens: 300, return_full_text: false } 
        }),
      }
    );
    if (!llmRes.ok) {
      const errText = await llmRes.text();
      throw new Error(`LLM API 에러: ${errText}`);
    }
    const llmJson = await llmRes.json();
    let aiOutput = { reasoning: "스타일 분석 중...", image_prompt: "korean street fashion model, realistic, 8k" };
    try {
      const text = llmJson[0]?.generated_text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) aiOutput = JSON.parse(jsonMatch[0]);
      }
    } catch (e) { console.error("LLM 파싱 실패 (기본값 사용)", e); }

    // 6. Image (Flux) 호출
    const imageRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { Authorization: `Bearer ${HF_API_TOKEN}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ inputs: aiOutput.image_prompt }),
      }
    );
    if (!imageRes.ok) throw new Error("이미지 생성 실패 (Hugging Face)");
    const imageBlob = await imageRes.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(
      JSON.stringify({ 
        image: `data:image/jpeg;base64,${base64}`,
        reasoning: aiOutput.reasoning,
        info: { temp, weather: weatherMain } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("서버 내부 에러:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "알 수 없는 에러가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
