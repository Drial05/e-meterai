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
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import dynamic from "next/dynamic";

// Matikan SSR untuk komponen PDF editor
const MeteraiEditor = dynamic(() => import("@/components/meteraiEditor"), {
  ssr: false,
});

interface SubmitPayload {
  base64: string;
  filename: string;
  page: number;
  pdf: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export default function SignMateraiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);
  const alreadyNotified = useRef(false);

  const intervalRef = useRef<number | null>(null);

  // 🔥 polling callback setiap 2 detik
  useEffect(() => {
    if (!polling || !documentId) return;
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

        // console.log("Response callback:", json);
        // console.log("Status callback:", status);

        const resDocument = await fetch(
          `/api/emeterai/cekDocuments?id=${documentId}`
        );
        const jsonDocument = await resDocument.json();

        // console.log("Cek Document Response:", jsonDocument);

        const stamping = jsonDocument?.data.data.attributes.stamping_status;

        // jika stamping sukses maka download file
        if (stamping === "success") {
          console.log("✔ Dokumen sudah success ditempel.");

          window.open(
            `/api/emeterai/download?id=${documentId}&filename=${filename}`,
            "_blank"
          );

          // Stop polling
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPolling(false);
        } else if (stamping === "in_progress") {
          if (!alreadyNotified.current) {
            toast.info("⏳ Proses penempelan materai masih berlangsung...", {
              duration: 3000,
            });
            alreadyNotified.current = true;
          }
        } else {
          toast.error(
            "⚠ Gagal menempel materai pada dokumen, Silakan coba ulang.",
            {
              duration: 5000,
            }
          );
          // Stop polling
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPolling(false);
        }
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

  const callApiSign = async (data: SubmitPayload) => {
    setLoading(true);

    const { base64, filename, page, pdf, position } = data;

    try {
      const res = await fetch("/api/emeterai/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doc: base64,
          filename,
          annotations: [
            {
              page,
              position_x: position.x,
              position_y: position.y,
              element_width: position.width,
              element_height: position.height,
              canvas_width: pdf.width,
              canvas_height: pdf.height,
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
      // console.log("DocID:", id);
      // mulai polling
      setPolling(true);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Terjadi kesalahan saat mengunggah dokumen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-full px-2">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Tempel Meterai pada Dokumen
          </CardTitle>
        </CardHeader>

        <CardContent>
          <MeteraiEditor onSubmit={callApiSign} />

          {loading && (
            <Button disabled className="mt-4 w-full">
              <Loader2 className="animate-spin mr-2" /> Mengirim...
            </Button>
          )}
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Pastikan dokumen sudah benar sebelum dikirim untuk di meterai.
        </CardFooter>
      </Card>
    </div>
  );
}
