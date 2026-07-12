// Server-side only — Gemini Flash vision API client

export type AISolution = {
  title: string;
  approach: string;
  algorithm: string[];
  jsCode: string;
  pyCode: string;
  timeComplexity: string;
  spaceComplexity: string;
  difficulty: "Easy" | "Medium" | "Hard";
  error?: never;
};

export type AIError = {
  error: string;
  title?: never;
};

export type GeminiResult = AISolution | AIError;

// Primary model, with a fallback in case one is rate-limited
const MODELS = [
  "gemini-flash-latest",
  "gemini-pro-latest",
];

const BASE_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `You are an expert DSA (Data Structures & Algorithms) tutor.
The user will give you an image of a coding/DSA problem (e.g., from LeetCode, HackerRank, GeeksForGeeks, etc.).

Analyze the problem and respond with ONLY a valid JSON object (no markdown fences, no extra text) with exactly these fields:
{
  "title": "<short problem title>",
  "difficulty": "<Easy|Medium|Hard>",
  "approach": "<2-4 sentence explanation of the optimal approach>",
  "algorithm": ["<step 1>", "<step 2>", "<step 3>", ...],
  "jsCode": "<complete working JavaScript solution>",
  "pyCode": "<complete working Python solution>",
  "timeComplexity": "<e.g. O(n log n)>",
  "spaceComplexity": "<e.g. O(n)>"
}

Rules:
- If the image does NOT contain a coding/DSA problem, return: {"error": "This doesn't look like a coding problem. Please upload a screenshot of a DSA question."}
- Keep code clean, well-commented, and beginner-friendly
- algorithm array should have 3-6 concrete steps
- Code must be complete and runnable`;

async function tryModel(
  model: string,
  apiKey: string,
  base64Image: string,
  mimeType: string,
): Promise<GeminiResult | null> {
  const endpoint = `${BASE_ENDPOINT}/${model}:generateContent`;

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image.replace(/^data:[^;]+;base64,/, ""),
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  // Up to 2 retries with longer backoff for rate-limit errors
  const MAX_RETRIES = 2;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json() as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      try {
        return JSON.parse(cleaned) as GeminiResult;
      } catch {
        console.error(`Gemini (${model}) parse error:`, cleaned);
        return {
          error: "Could not parse AI response. Please try again with a clearer image.",
        };
      }
    }

    if (res.status === 429) {
      if (attempt < MAX_RETRIES) {
        // Wait longer — 15s then 30s
        const delay = attempt * 15_000;
        console.warn(`Gemini (${model}) rate limited. Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      // Rate-limited on this model — signal caller to try next model
      console.warn(`Gemini (${model}) rate limited after all retries.`);
      return null;
    }

    const errText = await res.text();
    console.error(`Gemini (${model}) error:`, res.status, errText);
    return { error: `AI service error (${res.status}). Please try again.` };
  }

  return null;
}

export async function solveWithGemini(
  base64Image: string,
  mimeType: string = "image/jpeg",
): Promise<GeminiResult> {
  const apiKey = process.env["GEMINI_API_KEY"];

  if (!apiKey) {
    return {
      error:
        "Gemini API key not configured. Add GEMINI_API_KEY to your .env file.",
    };
  }

  // Try each model in order — if one is rate-limited, fall through to the next
  for (const model of MODELS) {
    const result = await tryModel(model, apiKey, base64Image, mimeType);
    if (result !== null) {
      return result;
    }
    console.warn(`Falling back from ${model} to next model...`);
  }

  return {
    error:
      "All AI models are currently rate-limited. Please wait 1 minute and try again.",
  };
}
