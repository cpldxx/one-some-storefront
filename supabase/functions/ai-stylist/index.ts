import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');

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
  "image_prompt": "3-5 English keywords for the exact outfit - e.g. 'oversized black coat minimal' or 'casual blue denim jacket'"
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
    const defaultPrompt = `${userStyle} korean fashion`;
    const bodyInfo = profile.height && profile.weight ?
      `Perfect for your height (${profile.height}cm) and weight (${profile.weight}kg). ` : '';

    let aiOutput = {
      reasoning: `${bodyInfo}We recommend a ${userStyle} style outfit for today's weather (${temp}°C, ${weatherMain}). This look is tailored perfectly for you!`,
      image_prompt: defaultPrompt
    };

    try {
      const text = llmJson.choices?.[0]?.message?.content;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiOutput.reasoning = parsed.reasoning || aiOutput.reasoning;
          aiOutput.image_prompt = parsed.image_prompt || aiOutput.image_prompt;

          // Keep prompt concise (max 5 words for better image results)
          const words = aiOutput.image_prompt.split(' ').slice(0, 5).join(' ');
          aiOutput.image_prompt = words;
        }
      }
    } catch (e) {
      console.error('[AI Stylist] LLM 파싱 실패 (기본값 사용)', e);
    }

    console.log('[AI Stylist] Image prompt:', aiOutput.image_prompt);

    // 3. 이미지 검색 (Pexels API - 사용자 체형에 맞는 패션 사진)
    // Build body type keywords based on actual user data
    let bodyTypeKeywords = '';

    if (profile.height && profile.weight) {
      // Calculate approximate body type from height/weight
      const heightM = profile.height / 100;
      const bmi = profile.weight / (heightM * heightM);

      if (bmi < 18.5) {
        bodyTypeKeywords = 'slim fit';
      } else if (bmi >= 18.5 && bmi < 25) {
        bodyTypeKeywords = 'regular fit';
      } else {
        bodyTypeKeywords = 'relaxed fit';
      }
    }

    // Add gender-specific keywords
    const genderKeyword = profile.gender === 'male' ? 'man' :
                         profile.gender === 'female' ? 'woman' : 'person';

    // Add weather/season-specific keywords based on temperature
    let seasonKeywords = '';
    if (temp <= 0) {
      seasonKeywords = 'winter cold weather heavy coat warm layered';
    } else if (temp > 0 && temp <= 10) {
      seasonKeywords = 'winter fall jacket coat layered';
    } else if (temp > 10 && temp <= 20) {
      seasonKeywords = 'spring fall light jacket';
    } else if (temp > 20 && temp <= 28) {
      seasonKeywords = 'summer spring light casual';
    } else {
      seasonKeywords = 'summer hot weather light breathable';
    }

    // Combine all search terms with weather priority - emphasize full body front-facing shots
    const searchQuery = `front view frontal full length portrait full body ${genderKeyword} ${seasonKeywords} ${bodyTypeKeywords} ${aiOutput.image_prompt} fashion model street photography`;

    console.log('[AI Stylist] 검색 쿼리:', searchQuery);

    const pexelsRes = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=20&orientation=portrait`,
      {
        headers: {
          Authorization: PEXELS_API_KEY || '',
        },
      }
    );

    let imageUrl = 'https://via.placeholder.com/400x600?text=No+Image';

    if (pexelsRes.ok) {
      const pexelsData = await pexelsRes.json();
      if (pexelsData.photos && pexelsData.photos.length > 0) {
        // Always use the first (most relevant) photo for consistency
        imageUrl = pexelsData.photos[0].src.large;
      }
    }

    console.log('[AI Stylist] Pexels 이미지 검색 완료:', searchQuery);

    return new Response(
      JSON.stringify({
        image: imageUrl,
        reasoning: aiOutput.reasoning,
        info: { temp, weather: weatherMain }
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
