import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomeAiSection() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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

          // Get current session token
          const { data: { session } } = await supabase.auth.getSession();
          console.log('[AI Stylist] Session:', session ? 'Valid' : 'None');

          const { data, error } = await supabase.functions.invoke("ai-stylist", {
            body: {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              profile,
            },
            headers: session ? {
              Authorization: `Bearer ${session.access_token}`,
            } : undefined,
          });
          console.log('[AI Stylist] Response:', { data, error });
          if (error) {
            console.error('[AI Stylist] Error:', error);
            setError(`Error: ${error.message || 'Unknown error'}`);
          } else {
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
        <div className="flex-1 flex items-center justify-center min-h-[320px]">
          {result?.image ? (
            <img
              src={`data:image/png;base64,${result.image}`}
              alt="AI Stylist Result"
              className="rounded-xl shadow-2xl max-w-full max-h-[400px] object-contain"
            />
          ) : (
            <div className="w-full h-[320px] flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-gray-500 text-xl">
              {loading ? "Generating image..." : "Your AI look will appear here"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
