const publicBaseUrl =
  process.env.NEXT_PUBLIC_R2_BASE_URL ?? "";

export function storagePublicUrl(src: string) {
  if (!publicBaseUrl) return src;
  return `${publicBaseUrl.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
}
