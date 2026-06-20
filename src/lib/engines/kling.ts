// Motor de vídeo Kling (oficial, api-singapore.klingai.com). Auth: Bearer KLING_API_KEY.
// Asíncrono: submit → task_id → poll del estado hasta succeed/failed.
const BASE = process.env.KLING_BASE || "https://api-singapore.klingai.com";
const MODEL = process.env.KLING_MODEL || "kling-v1";

function key(): string | undefined {
  return process.env.KLING_API_KEY;
}

export function klingAvailable(): boolean {
  return Boolean(key());
}

export async function submitKlingVideo(opts: {
  prompt: string;
  durationSec: number;
  aspectRatio?: string;
}): Promise<{ taskId?: string; error?: string }> {
  const k = key();
  if (!k) return { error: "Kling no configurado" };
  try {
    const res = await fetch(`${BASE}/v1/videos/text2video`, {
      method: "POST",
      headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: MODEL,
        prompt: opts.prompt,
        duration: String(opts.durationSec),
        aspect_ratio: opts.aspectRatio || "16:9",
        mode: "std",
      }),
    });
    const d = await res.json().catch(() => ({}));
    if (d?.code === 0 && d?.data?.task_id) return { taskId: d.data.task_id as string };
    return { error: d?.message || `Kling error (${d?.code ?? res.status})` };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function pollKlingVideo(
  taskId: string,
): Promise<{ status: "running" | "done" | "error"; url?: string; error?: string }> {
  const k = key();
  if (!k) return { status: "error", error: "Kling no configurado" };
  try {
    const res = await fetch(`${BASE}/v1/videos/text2video/${taskId}`, {
      headers: { Authorization: `Bearer ${k}` },
    });
    const d = await res.json().catch(() => ({}));
    const st = d?.data?.task_status as string | undefined;
    if (st === "succeed") {
      const url = d?.data?.task_result?.videos?.[0]?.url as string | undefined;
      return url ? { status: "done", url } : { status: "error", error: "Vídeo sin URL" };
    }
    if (st === "failed") return { status: "error", error: d?.data?.task_status_msg || "Vídeo fallido" };
    return { status: "running" };
  } catch (e) {
    return { status: "error", error: (e as Error).message };
  }
}
