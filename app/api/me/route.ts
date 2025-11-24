import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token tidak ditemukan!" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Token tidak valid!" },
        { status: 403 }
      );
    }

    const [rows]: any = await pool.query(
      "SELECT id, username, telepon, email, role, created_at FROM users WHERE id = ?",
      [decoded.id]
    );
    if (rows.length === 0) {
      return NextResponse.json(
        { message: "User tidak ditemukan!" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
