import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// simple in-memory rate limit (MVP)
const requests = new Map();

export async function POST(req) {
  try {
    // -----------------------------
    // RATE LIMIT
    // -----------------------------
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "local";

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 min
    const limit = 5;

    if (!requests.has(ip)) requests.set(ip, []);

    const timestamps = requests
      .get(ip)
      .filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      return Response.json(
        { error: "Rate limit exceeded. Try again in 1 minute." },
        { status: 429 }
      );
    }

    timestamps.push(now);
    requests.set(ip, timestamps);

    // -----------------------------
    // INPUT
    // -----------------------------
    const {
      business,
      audience,
      goal,
      platform,
      tone,
      contentType,
      extra,
    } = await req.json();

    if (!business) {
      return Response.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // PROMPT (HIGH QUALITY)
    // -----------------------------
    const prompt = `
You are a world-class social media strategist and copywriter.

Create HIGH-CONVERTING content.

Business: ${business}
Target Audience: ${audience || "General audience"}
Goal: ${goal || "Engagement"}
Platform: ${platform}
Content Type: ${contentType}
Tone: ${tone}
Extra Context: ${extra || "None"}

IMPORTANT:
- Write like a HUMAN, not AI
- No generic phrases
- Make captions catchy and scroll-stopping
- Keep it platform-specific
- Use emojis where appropriate (not excessive)

Return in CLEAN MARKDOWN format:

## 🔥 Captions
- Caption 1
- Caption 2
- Caption 3

## 📢 Hashtags
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10

## 💡 Content Ideas
1. Idea 1
2. Idea 2
3. Idea 3
`;

    // -----------------------------
    // GROQ STREAM
    // -----------------------------
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content;

            // safer streaming
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (streamError) {
          controller.enqueue(
            encoder.encode("\n\n⚠️ Stream interrupted.")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("API ERROR:", err);

    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}