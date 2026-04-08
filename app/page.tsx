"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Page() {
  const [form, setForm] = useState<FormState>({
  business: "",
  audience: "",
  goal: "engagement",
  platform: "instagram",
  tone: "viral",
  contentType: "post",
  extra: "",
});

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  type FormState = {
  business: string;
  audience: string;
  goal: string;
  platform: string;
  tone: string;
  contentType: string;
  extra: string;
};

const handleChange = (key: keyof FormState, value: string) => {
  setForm((prev) => ({ ...prev, [key]: value }));
};

  const generate = async () => {
    if (!form.business) return;

    setLoading(true);
    setResult("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const reader = res.body?.getReader();
    if (!reader) {
      setResult("Error: No response stream");
      setLoading(false);
      return;
    }

    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      text += decoder.decode(value);
      setResult(text);
    }

    setLoading(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-6">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          AI Content Generator
        </h1>
        <p className="text-white/50 text-sm mt-2">
          Create high-performing social media content in seconds
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        {/* LEFT SIDE - INPUTS */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">

          <input
            placeholder="Business name (e.g. FBPitch)"
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            value={form.business}
            onChange={(e) => handleChange("business", e.target.value)}
          />

          <input
            placeholder="Target audience (e.g. football fans)"
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            value={form.audience}
            onChange={(e) => handleChange("audience", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-4 rounded-xl bg-black/40 border border-white/10"
              value={form.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
            >
              <option value="engagement">Engagement</option>
              <option value="sales">Sales</option>
              <option value="followers">Followers</option>
            </select>

            <select
              className="p-4 rounded-xl bg-black/40 border border-white/10"
              value={form.platform}
              onChange={(e) => handleChange("platform", e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-4 rounded-xl bg-black/40 border border-white/10"
              value={form.tone}
              onChange={(e) => handleChange("tone", e.target.value)}
            >
              <option value="viral">Viral</option>
              <option value="luxury">Luxury</option>
              <option value="funny">Funny</option>
              <option value="professional">Professional</option>
            </select>

            <select
              className="p-4 rounded-xl bg-black/40 border border-white/10"
              value={form.contentType}
              onChange={(e) => handleChange("contentType", e.target.value)}
            >
              <option value="post">Post</option>
              <option value="reel">Reel</option>
              <option value="ad">Ad</option>
            </select>
          </div>

          <textarea
            placeholder="Extra details (offers, product, vibe...)"
            rows={3}
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
            value={form.extra}
            onChange={(e) => handleChange("extra", e.target.value)}
          />

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 font-medium hover:opacity-90 transition"
          >
            {loading ? "Generating..." : "Generate Content"}
          </button>
        </div>

        {/* RIGHT SIDE - OUTPUT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative min-h-[500px]">

          {result && (
            <button
              onClick={copy}
              className="absolute top-4 right-4 text-xs px-3 py-1 rounded bg-black/40 border border-white/10"
            >
              Copy
            </button>
          )}

          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            {loading && !result ? (
              <p className="text-white/40 animate-pulse">
                Generating content...
              </p>
            ) : result ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            ) : (
              <p className="text-white/30">
                Your generated content will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-white/30 text-sm mt-10">
        Built for creators who want to grow faster 🚀
      </div>
    </div>
  );
}