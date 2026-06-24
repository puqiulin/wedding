import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const publicRoot = path.join(process.cwd(), "public");
const allowedFolders = new Set(["album", "cover", "music"]);

function normalizeFolder(folder: unknown) {
  const value = typeof folder === "string" && folder ? folder : "album";
  if (!allowedFolders.has(value)) {
    throw new Error("Unsupported upload folder");
  }
  return value;
}

function safeFileName(fileName: string) {
  const parsed = path.parse(fileName);
  const base = parsed.name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const ext = parsed.ext.replace(/[^\w.]/g, "").slice(0, 16).toLowerCase();
  return `${Date.now()}-${randomUUID()}-${base || "upload"}${ext}`;
}

function resolvePublicAsset(src: string) {
  const relative = src.replace(/^\/+/, "");
  const target = path.resolve(publicRoot, relative);
  if (!target.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Invalid public asset path");
  }
  return target;
}

export async function savePublicAsset(file: File, folderInput: unknown) {
  const folder = normalizeFolder(folderInput);
  const filename = safeFileName(file.name);
  const dir = path.join(publicRoot, folder);
  const target = path.join(dir, filename);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));

  return {
    src: `/${folder}/${filename}`,
    fileName: file.name,
    fileSize: file.size,
  };
}

export async function deletePublicAsset(src: string) {
  if (!src.startsWith("/album/") && !src.startsWith("/cover/") && !src.startsWith("/music/")) return;

  await fs.rm(resolvePublicAsset(src), { force: true });
}

export async function readPublicAsset(src: string) {
  if (!src.startsWith("/album/") && !src.startsWith("/cover/") && !src.startsWith("/music/")) {
    return null;
  }

  try {
    const filePath = resolvePublicAsset(src);
    const data = await fs.readFile(filePath);
    return {
      data,
      contentType: contentTypeFor(filePath),
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function contentTypeFor(filePath: string) {
  switch (path.extname(filePath).toLowerCase()) {
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".aac":
      return "audio/aac";
    case ".m4a":
      return "audio/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".ogg":
      return "audio/ogg";
    case ".wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
}
