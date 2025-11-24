import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, telepon, email, password } = body;

    if (!username || !telepon || !email || !password) {
      return NextResponse.json(
        { message: "Semua field wajib diisi!" },
        { status: 400 }
      );
    }

    const [existingUser]: any = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      NextResponse.json({ message: "Email sudah terdaftar!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, telepon, email, password) VALUES (?, ?, ?, ?)",
      [username, telepon, email, hashedPassword]
    );

    return NextResponse.json(
      { message: "Registrasi berhasil!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error register:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
