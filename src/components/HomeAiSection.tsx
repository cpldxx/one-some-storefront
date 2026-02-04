import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomeAiSection() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [result, setResult] = useState<{ image: string; reasoning: string; weather: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    if (!profile) {
      setError("Please login to use the AI Stylist.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          console.log('[AI Stylist] Calling function with:', { lat: pos.coords.latitude, lon: pos.coords.longitude, profile });

          // Direct fetch to bypass Supabase client JWT enforcement
          const functionUrl = 'https://mdbjlufzfstekqgjceuq.supabase.co/functions/v1/ai-stylist';

          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              profile,
            }),
          });

          console.log('[AI Stylist] Response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI Stylist] Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          console.log('[AI Stylist] Response data:', data);

          if (data.error) {
            setError(`Error: ${data.error}`);
          } else {
            setImageLoading(true);
            setResult(data);
          }
        } catch (e: any) {
          console.error('[AI Stylist] Exception:', e);
          setError(`AI Stylist failed: ${e.message || 'Please try again.'}`);
        }
        setLoading(false);
      },
      () => {
        setError("Location permission is required.");
        setLoading(false);
      }
    );
  };

  return (
    <section className="w-full bg-black text-white py-16 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Controls & Text */}
        <div className="flex-1 flex flex-col items-start">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">WEAR YOUR IDENTITY</h2>
          <p className="mb-8 text-lg text-gray-300 max-w-lg">
            Get a hyper-personalized outfit suggestion and AI-generated look, just for you.
          </p>
          {user ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-gray-200 transition"
            >
              {loading ? "Analyzing..." : "Generate My AI Look"}
            </button>
          ) : (
            <a
              href="/login"
              className="bg-white text-black px-6 py-3 rounded-lg font-bold text-lg shadow hover:bg-gray-200 transition"
            >
              Login to try AI Stylist
            </a>
          )}
          {error && <div className="mt-6 text-red-400 font-semibold">{error}</div>}
          {result && (
            <blockquote className="mt-8 p-6 bg-white/10 border-l-4 border-white text-lg rounded-lg font-medium">
              {result.reasoning}
            </blockquote>
          )}
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex items-center justify-center min-h-[500px] relative">
          {result?.image ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">이미지 생성 중...</p>
                  </div>
                </div>
              )}
              <img
                src={result.image}
                alt="AI Stylist Result"
                className="rounded-xl shadow-2xl max-w-full max-h-[600px] object-contain"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setError('이미지 로드 실패');
                }}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </>
          ) : (
            <div className="w-full h-[500px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-gray-500 text-xl">
              {loading ? "Analyzing..." : "Your AI look will appear here"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
