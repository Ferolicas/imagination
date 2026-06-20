import { experimental_generateImage as generateImage } from "ai";
import { openai } from "@ai-sdk/openai";
import type { ImageEngine, ImageGenRequest, ImageGenResult } from "./types";
import { saveImageBytes } from "../storage";

// Motor de PAGO: OpenAI gpt-image-1. La calidad del plan mapea a low/medium/high.
function sizeFor(w: number, h: number): "1024x1024" | "1024x1536" | "1536x1024" {
  if (w > h) return "1536x1024";
  if (h > w) return "1024x1536";
  return "1024x1024";
}

export const openaiImageEngine: ImageEngine = {
  id: "openai",
  available: () => Boolean(process.env.OPENAI_API_KEY),
  async generate(req: ImageGenRequest): Promise<ImageGenResult> {
    const quality = req.quality === "premium" ? "high" : req.quality === "alta" ? "medium" : "low";
    const { images } = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt: req.prompt,
      n: Math.max(1, req.count),
      size: sizeFor(req.width, req.height),
      providerOptions: { openai: { quality } },
    });
    const urls: string[] = [];
    for (const img of images) {
      urls.push(await saveImageBytes(img.uint8Array, "png"));
    }
    return { images: urls, engine: "openai", model: "gpt-image-1" };
  },
};
