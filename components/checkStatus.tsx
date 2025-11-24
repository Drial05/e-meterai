"use client";
import { useState } from "react";

export default function CheckStatus() {
  const [status, setStatus] = useState("");

  const check = async () => {
    const res = await fetch("/api/ematerai/status");
    const json = await res.json();
    setStatus(JSON.stringify(json, null, 2));
  };

  return (
    <div>
      <button
        onClick={check}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Cek Status
      </button>
      <pre className="text-sm mt-3 bg-gray-200 p-3 rounded">{status}</pre>
    </div>
  );
}
