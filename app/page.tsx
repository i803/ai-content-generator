"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type FormState = {
  business: string;
  audience: string;
  goal: string;
  platform: string;
  tone: string;
  contentType: string;
  extra: string;
};

type HistoryItem = {
  id: number;
  input: FormState;
  output: string;
};

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
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const outputRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const templates = [
    {
      name: "Viral Hook",
      extra: "Make it viral with a strong hook in the first line",
    },
    {
      name: "Luxury Ad",
      extra: "Make it feel premium and luxury styled",
    },
    {
      name: "High Engagement",
      extra: "Add CTA to increase comments and shares",
    },
  ];

  const applyTemplate = (text: string) => {
    setForm((prev) => ({ ...prev, extra: text }));
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const generate = async () => {
    if (!form.business) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setResult("");

    const res = await fetch("/api/generate", {
      method: "POST",
      signal: abortRef.current.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const reader = res.body?.getReader();
    if (!reader) {
      setLoading(false);
      setResult("Error: No response stream");
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

    setHistory((prev) => [
      {
        id: Date.now(),
        input: form,
        output: text,
      },
      ...prev.slice(0, 4),
    ]);

    setLoading(false);
    scrollToBottom();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      generate();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-4 sm:p-6">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
          AI Content Generator
        </h1>
        <p className="text-white/50 text-xs sm:text-sm mt-2">
          Generate viral social media content instantly
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* LEFT PANEL */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4">

          {/* INPUTS */}
          <input
            placeholder="Business name"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
            value={form.business}
            onChange={(e) => handleChange("business", e.target.value)}
          />

          <input
            placeholder="Target audience"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
            value={form.audience}
            onChange={(e) => handleChange("audience", e.target.value)}
          />

          {/* SELECTS */}
          <div className="grid grid-cols-2 gap-3">
            <select
              className="p-3 rounded-xl bg-black/40 border border-white/10"
              value={form.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
            >
              <option>engagement</option>
              <option>sales</option>
              <option>followers</option>
            </select>

            <select
              className="p-3 rounded-xl bg-black/40 border border-white/10"
              value={form.platform}
              onChange={(e) => handleChange("platform", e.target.value)}
            >
              <option>instagram</option>
              <option>tiktok</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="p-3 rounded-xl bg-black/40 border border-white/10"
              value={form.tone}
              onChange={(e) => handleChange("tone", e.target.value)}
            >
              <option>viral</option>
              <option>luxury</option>
              <option>funny</option>
              <option>professional</option>
            </select>

            <select
              className="p-3 rounded-xl bg-black/40 border border-white/10"
              value={form.contentType}
              onChange={(e) => handleChange("contentType", e.target.value)}
            >
              <option>post</option>
              <option>reel</option>
              <option>ad</option>
            </select>
          </div>

          {/* TEMPLATE CHIPS */}
          <div className="flex flex-wrap gap-2">
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(t.extra)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* EXTRA */}
          <textarea
            rows={3}
            placeholder="Extra details"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
            value={form.extra}
            onChange={(e) => handleChange("extra", e.target.value)}
          />

          {/* BUTTON */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 font-medium active:scale-95 transition"
          >
            {loading ? "Generating..." : "Generate (Ctrl + Enter)"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div
          ref={outputRef}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 min-h-[300px] sm:min-h-[500px] relative"
        >
          {/* COPY */}
          {result && (
            <button
              onClick={copy}
              className="absolute top-3 right-3 text-xs px-3 py-1 rounded bg-black/40 border border-white/10"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}

          {/* CONTENT */}
          <div className="prose prose-invert max-w-none text-sm">
            {loading && !result ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
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

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8">
          <h2 className="text-sm text-white/60 mb-2">Recent Generations</h2>
          <div className="grid gap-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60"
              >
                {h.input.business} • {h.input.platform} • {h.input.tone}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center text-white/30 text-xs sm:text-sm mt-10">
        Built for creators who want to grow faster 🚀
      </div>
    </div>
  );
}
