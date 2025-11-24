import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export async function GET() {
  const isConnected = await testConnection();

  if (isConnected) {
    return NextResponse.json({
      status: "success",
      message: "Database connected ✅",
    });
  } else {
    return NextResponse.json(
      { status: "error", message: "Failed to connect ❌" },
      { status: 500 }
    );
  }
}
