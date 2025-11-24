export const runtime = "nodejs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();

  const clientId = process.env.MEKARI_CLIENT_ID || "";
  const clientSecret = process.env.MEKARI_CLIENT_SECRET || "";
  const baseUrl = process.env.MEKARI_API_BASE_URL || "";
  const path = "/v2/esign-hmac/v1/documents/stamp";
  const method = "POST";

  // tambahkan callback url di server
  const callbackUrl =
    (process.env.CALLBACK_NGROK || "").replace(/\/$/, "") +
    "/api/emeterai/callback";
  const bodyWithCallback = { ...body, callback_url: callbackUrl };

  const date = new Date().toUTCString();
  const signingString = `date: ${date}\n${method} ${path} HTTP/1.1`;
  const signature = crypto
    .createHmac("sha256", clientSecret)
    .update(signingString)
    .digest("base64");

  const authHeader = `hmac username="${clientId}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`;

  const bodyString = JSON.stringify(bodyWithCallback);
  const bodyHash = crypto
    .createHash("sha256")
    .update(bodyString)
    .digest("base64");
  const digestHeader = `SHA-256=${bodyHash}`;

  try {
    const response = await axios({
      method,
      url: baseUrl + path,
      headers: {
        Authorization: authHeader,
        Date: date,
        Digest: digestHeader,
        "Content-Type": "application/json",
      },
      data: bodyWithCallback,
    });

    return NextResponse.json({
      data: response.data,
      status: response.status,
      success: true,
    });
  } catch (error: any) {
    console.error("Mekari API Error:", error.response?.data || error.message);
    // kirim error ke frontend
    return NextResponse.json(
      {
        success: false,
        status: error.response?.status || 500,
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
