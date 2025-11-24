// lib/db.ts
import mysql from "mysql2/promise";

declare global {
  // agar tidak membuat banyak pool saat development
  var __MYSQL_POOL__: mysql.Pool | undefined;
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_ROOT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// fungsi untuk mengetes koneksi
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Koneksi database berhasil!");
    connection.release();
    return true;
  } catch (error) {
    console.error("Koneksi database gagal:", error);
    return false;
  }
}

export default pool;
