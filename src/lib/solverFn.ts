import { createServerFn } from "@tanstack/react-start";
import { solveWithGemini } from "@/lib/gemini";

export const solveFromImage = createServerFn({ method: "POST" })
  .inputValidator((data: { imageBase64: string; mimeType?: string }) => data)
  .handler(async ({ data }) => {
    const { imageBase64, mimeType = "image/jpeg" } = data;

    if (!imageBase64) {
      return { error: "No image provided." };
    }

    // Rough size guard: base64 of 10 MB ≈ 13.5 MB string
    if (imageBase64.length > 14_000_000) {
      return {
        error: "Image is too large. Please use a screenshot under 10 MB.",
      };
    }

    return await solveWithGemini(imageBase64, mimeType);
  });
