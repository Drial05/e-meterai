// app/api/ematerai/status/route.ts
import { NextResponse } from "next/server";

let lastCallback: any = null;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: lastCallback,
  });
}
