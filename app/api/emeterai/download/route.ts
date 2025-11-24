import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const filename = searchParams.get("filename") || `document-${id}.pdf`;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing document ID",
      },
      { status: 400 }
    );
  }

  const clientId = process.env.MEKARI_CLIENT_ID || "";
  const clientSecret = process.env.MEKARI_CLIENT_SECRET || "";
  const baseUrl = process.env.MEKARI_API_BASE_URL || "";
  const path = `/v2/esign-hmac/v1/documents/${id}/download`;
  const method = "GET";
  const date = new Date().toUTCString();

  const signingString = `date: ${date}\n${method} ${path} HTTP/1.1`;
  const signature = crypto
    .createHmac("sha256", clientSecret)
    .update(signingString)
    .digest("base64");

  const authHeader = `hmac username="${clientId}", algorithm="hmac-sha256", headers="date request-line", signature="${signature}"`;

  try {
    const response = await axios({
      method,
      url: baseUrl + path,
      headers: {
        Authorization: authHeader,
        Date: date,
      },
      responseType: "arraybuffer", // agar bisa return file biner
    });

    const stampedFilename = filename.replace(/\.pdf$/i, "") + "(stamped).pdf";

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${stampedFilename}"`,
      },
    });
  } catch (error) {
    console.error("Error download document:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
