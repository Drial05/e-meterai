// lib/mekari.ts
import crypto from "crypto";

export function makeHmacAuthHeader(
  clientId: string,
  clientSecret: string,
  method: string,
  path: string,
  date?: string
) {
  const now = date ?? new Date().toUTCString();
  const signingString = `date: ${now}\n${method} ${path} HTTP/1.1`;
  const signature = crypto
    .createHmac("sha256", clientSecret)
    .update(signingString)
    .digest("base64");
  const header = {
    Authorization: `hmac username="${clientId}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`,
    Date: now,
  };
  return { header, date: now, signingString };
}
