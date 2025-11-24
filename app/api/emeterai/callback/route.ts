import { NextResponse } from "next/server";

let lastCallback: any = null; // simpan global (ingat: untuk testing dev mode)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(
      "Callback diterima dari mekari:",
      JSON.stringify(body, null, 2)
    );

    const documentId = body?.data?.id;
    const status = body?.data?.attributes?.status;
    const filename = body?.data?.attributes?.filename;

    if (!documentId) {
      return NextResponse.json(
        { success: false, message: "documentId tidak ditemukan" },
        { status: 400 }
      );
    }

    // simpan callback untuk dipolling frontend
    lastCallback = {
      documentId,
      status,
      filename,
      raw: body,
    };

    return NextResponse.json({
      success: true,
      message: "Callback diterima dan disimpan",
      data: lastCallback,
    });
  } catch (error) {
    console.error("Error di callback route:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses callback" },
      { status: 500 }
    );
  }
}
export async function GET() {
  return NextResponse.json({
    success: true,
    callback: lastCallback,
  });
}
