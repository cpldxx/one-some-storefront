import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
const POLLINATIONS_API_KEY = Deno.env.get('POLLINATIONS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: "이 주소는 브라우저에서 직접 접속할 수 없습니다." }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { lat, lon, profile } = await req.json();
    if (lat === undefined || lon === undefined || !profile) {
      throw new Error("필수 정보가 누락되었습니다.");
    }

    console.log('[AI Stylist] 요청 받음:', {
      lat, lon,
      username: profile?.username,
      height: profile?.height,
      weight: profile?.weight,
      gender: profile?.gender,
      style: profile?.style_preferences
    });

    // 1. 날씨 조회
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    if (!weatherRes.ok) throw new Error(`날씨 API 에러`);

    const wData = await weatherRes.json();
    const temp = wData.main.temp;
    const weatherMain = wData.weather[0].main;

    console.log('[AI Stylist] 날씨:', weatherMain, temp + '°C');

    // 2. LLM 호출 (Groq - 빠르고 안정적)
    const llmRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a professional fashion stylist. Respond ONLY in English. Return responses as JSON only."
            },
            {
              role: "user",
              content: `A user is asking: "Recommend me a fashion style that considers my current location & weather, fits my body${profile.height && profile.weight ? ` (height ${profile.height}cm, weight ${profile.weight}kg)` : ''}, and matches my preferred fashion style."

User Profile:
- Gender: ${profile.gender || 'unisex'}${profile.height ? `\n- Height: ${profile.height} cm` : ''}${profile.weight ? `\n- Weight: ${profile.weight} kg` : ''}
- Style Preferences: ${profile.style_preferences?.join(', ') || 'casual, comfortable'}
- Bio: ${profile.bio || 'No specific preference'}

Current Location & Weather:
- Weather: ${weatherMain}
- Temperature: ${temp}°C

As a professional Korean fashion stylist, provide ONE consistent recommendation that:
1. Perfectly matches their body type (height/weight)
2. Suits their style preferences EXACTLY
3. Is appropriate for current weather
4. Follows Korean fashion trends
5. Is the BEST outfit for them (not random, but the ideal choice)

Return JSON (ALL TEXT IN ENGLISH):
{
  "reasoning": "2-3 English sentences explaining why THIS specific outfit is perfect for their body, style, and weather",
  "outfit_description": "Detailed outfit description including: top (color, style), bottom (type, color), shoes (style, color), and accessories if any. For example: 'white oversized cotton t-shirt, black slim-fit jeans, white minimalist sneakers, silver watch'"
}

Output ONLY JSON in ENGLISH. Be CONSISTENT - same profile should get similar recommendations.`
            }
          ],
          max_tokens: 300,
          temperature: 0.2  // Low temperature for consistent responses
        }),
      }
    );

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      throw new Error(`LLM API 에러: ${errText}`);
    }

    const llmJson = await llmRes.json();

    // Determine default style based on user preferences
    const userStyle = profile.style_preferences?.[0] || 'casual';
    const defaultOutfit = `${userStyle} korean fashion outfit, full body`;
    const bodyInfo = profile.height && profile.weight ?
      `Perfect for your height (${profile.height}cm) and weight (${profile.weight}kg). ` : '';

    let aiOutput = {
      reasoning: `${bodyInfo}We recommend a ${userStyle} style outfit for today's weather (${temp}°C, ${weatherMain}). This look is tailored perfectly for you!`,
      outfit_description: defaultOutfit
    };

    try {
      const text = llmJson.choices?.[0]?.message?.content;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiOutput.reasoning = parsed.reasoning || aiOutput.reasoning;
          aiOutput.outfit_description = parsed.outfit_description || aiOutput.outfit_description;
        }
      }
    } catch (e) {
      console.error('[AI Stylist] LLM 파싱 실패 (기본값 사용)', e);
    }

    console.log('[AI Stylist] Outfit description:', aiOutput.outfit_description);

    // 3. 서버에서 이미지 생성 (Pollinations API + Flux 모델)
    const stylePrefix = "flat lay product on white background";
    const styleSuffix = "studio photo high quality 4k";
    const imagePrompt = `${stylePrefix} ${aiOutput.outfit_description} ${styleSuffix}`;
    const randomSeed = Math.floor(Math.random() * 1000000);

    let imageUrl = '';
    let imageError: string | null = null;

    try {
      console.log('[Pollinations] Generating image with prompt:', imagePrompt);

      // Pollinations API - zimage (Z-Image Turbo: 빠른 6B + 2x 업스케일링)
      const imageApiUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(imagePrompt)}?model=zimage&seed=${randomSeed}&width=512&height=512&nologo=true`;

      console.log('[Pollinations] API URL:', imageApiUrl);

      // API 키 있으면 사용, 없으면 무료 티어로 시도
      const headers: Record<string, string> = {};
      if (POLLINATIONS_API_KEY) {
        headers['Authorization'] = `Bearer ${POLLINATIONS_API_KEY}`;
        console.log('[Pollinations] Using API key');
      } else {
        console.log('[Pollinations] Using free tier (no API key)');
      }

      // 타임아웃 설정 (45초 - 이미지 생성에 시간이 걸릴 수 있음)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const imageResponse = await fetch(imageApiUrl, {
          headers: headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('[Pollinations] Response status:', imageResponse.status);

        if (imageResponse.ok) {
          // 이미지를 Base64로 변환해서 반환 (브라우저에서 인증 없이 로드 가능)
          console.log('[Pollinations] Downloading image...');
          const imageBlob = await imageResponse.blob();
          console.log('[Pollinations] Image blob size:', imageBlob.size);

          // Base64 변환 - 청크로 나눠서 처리 (메모리 효율적)
          const arrayBuffer = await imageBlob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const chunkSize = 8192; // 8KB 청크

          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }

          const base64 = btoa(binary);
          imageUrl = `data:image/jpeg;base64,${base64}`;
          console.log('[Pollinations] Image converted to base64, size:', base64.length);
        } else if (imageResponse.status === 429) {
          // 크레딧 소진 또는 Rate Limit
          imageError = 'RATE_LIMIT';
          const errorText = await imageResponse.text();
          console.error('[Pollinations] Rate limit:', errorText);
        } else if (imageResponse.status === 402) {
          // 결제 필요 (크레딧 없음)
          imageError = 'NO_CREDITS';
          const errorText = await imageResponse.text();
          console.error('[Pollinations] No credits:', errorText);
        } else {
          const errorText = await imageResponse.text();
          console.error('[Pollinations] Failed:', imageResponse.status, errorText);
          imageError = 'API_ERROR';
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('[Pollinations] Timeout after 30s');
          imageError = 'NETWORK_ERROR';
        } else {
          throw fetchError;
        }
      }
    } catch (error: any) {
      console.error('[Pollinations] Error:', error.message || error);
      console.error('[Pollinations] Error stack:', error.stack);
      imageError = 'NETWORK_ERROR';
    }

    return new Response(
      JSON.stringify({
        outfit_description: aiOutput.outfit_description,
        reasoning: aiOutput.reasoning,
        weather: { temp, main: weatherMain },
        image: imageUrl || null,
        imageError: imageError // 에러 타입 전달
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[AI Stylist] 서버 내부 에러:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || "알 수 없는 에러가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
