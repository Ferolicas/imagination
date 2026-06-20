import { mkdir, writeFile, readFile } from "fs/promises";
import { join, normalize } from "path";
import { nanoid } from "nanoid";

// Almacén de imágenes en disco del VPS (fuera del repo, sobrevive a los deploys).
const ROOT = process.env.STORAGE_DIR || join(process.cwd(), ".data");

export async function saveImageBytes(bytes: Uint8Array, ext = "png"): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const dir = join(ROOT, "img", day);
  await mkdir(dir, { recursive: true });
  const name = `${nanoid(14)}.${ext}`;
  await writeFile(join(dir, name), bytes);
  return `/i/${day}/${name}`;
}

export async function readStoredImage(
  rel: string,
): Promise<{ bytes: Uint8Array; type: string } | null> {
  const safe = normalize(rel).replace(/^([./\\])+/, "");
  try {
    const bytes = await readFile(join(ROOT, "img", safe));
    const ext = safe.split(".").pop()?.toLowerCase();
    const type =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    return { bytes, type };
  } catch {
    return null;
  }
}
