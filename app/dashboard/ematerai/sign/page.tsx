"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignMateraiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 🔥 polling callback setiap 2 detik
  useEffect(() => {
    if (!polling) return;

    // cegah double polling
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      try {
        const res = await fetch("/api/emeterai/callback");

        if (!res.ok) {
          console.warn("Callback masih belum siap...");
          return;
        }

        const json = await res.json();
        const status = json?.callback?.status;

        console.log("Response callback:", json);
        console.log("Status callback:", status);

        window.open(
          `/api/emeterai/download?id=${documentId}&filename=${filename}`,
          "_blank"
        );

        console.log("✔ Meterai selesai, file siap di-download.");

        setPolling(false);

        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [polling]);

  const callApiSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (!file) {
      alert("File wajib diisi!");
      return;
    }

    try {
      const base64String = await convertToBase64(file);
      const cleanBase64 = base64String.split(",")[1];

      const res = await fetch("/api/emeterai/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doc: cleanBase64,
          filename: file.name,
          annotations: [
            {
              page: 1,
              position_x: 100,
              position_y: 100,
              element_width: 80,
              element_height: 80,
              canvas_width: 595,
              canvas_height: 841,
              type_of: "meterai",
            },
          ],
        }),
      });

      const data = await res.json();
      setResult(data);

      const id = data?.data?.data?.id;
      const fname = data?.data?.data?.attributes?.filename;

      setDocumentId(id);
      setFilename(fname);

      console.log("DocID:", id);

      // mulai polling
      setPolling(true);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setFile(null);
      (e.target as HTMLFormElement).reset(); // reset form agar input file kosong
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-full px-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Upload Dokumen yang akan di meterai
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={callApiSign} className="space-y-4">
            <div>
              <Label htmlFor="file" className="py-4">
                Upload Dokumen
              </Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Format: PDF, DOC, DOCX — Maks 10MB
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Mengunggah...
                </>
              ) : (
                "Kirim untuk di Meterai"
              )}
            </Button>
          </form>
        </CardContent>

        {/* {result && (
          <pre className="mt-4 p-2 bg-gray-100 rounded text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )} */}

        <CardFooter className="text-center text-sm text-muted-foreground">
          Pastikan dokumen sudah benar sebelum dikirim untuk di meterai.
        </CardFooter>
      </Card>
    </div>
  );
}
