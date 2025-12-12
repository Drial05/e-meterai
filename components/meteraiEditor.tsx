"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PdfInfo = {
  width: number;
  height: number;
};

export type SubmitPayload = {
  base64: string;
  filename: string;
  page: number;
  pdf: PdfInfo;
  position: Position;
};

interface Props {
  onSubmit: (data: SubmitPayload) => void;
}

export default function MeteraiEditor({ onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // posisi meterai pada layer
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [meteraiSize, setMeteraiSize] = useState(100);
  const [pdfWidth, setPdfWidth] = useState<number>();

  useEffect(() => {
    if (containerRef.current) {
      setPdfWidth(containerRef.current.clientWidth);
    }
  }, [file]);

  // update meterai size untuk mobile
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setPdfWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // responsive meterai size
  useEffect(() => {
    if (pdfWidth) {
      setMeteraiSize(pdfWidth * 0.12);
    }
  }, [pdfWidth]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // ambil ukuran PDF asli
  const getPdfRealSize = async (f: File) => {
    const arrayBuffer = await f.arrayBuffer();
    // load PDF hanya sekali
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pdf.numPages);
    const viewport = page.getViewport({ scale: 1 });
    const info = { width: viewport.width, height: viewport.height };
    setPdfInfo(info);
    return info;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      await getPdfRealSize(f);
    }
  };

  const toBase64 = (f: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Unexpected FileReader result type"));
        }
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(f);
    });
  };

  // Upload PDF
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Plase upload a PDF file first.");
      return;
    }

    if (!pdfInfo) {
      toast.error("Menunggu informasi PDF...");
      return;
    }

    try {
      const b64 = await toBase64(file);
      const cleanBase64 = b64.split(",")[1];

      // hitung posisi Real untuk API
      const realX = pos.x / scale;
      const realY = pos.y / scale;
      const realW = meteraiSize / scale;
      const realH = meteraiSize / scale;

      const payload: SubmitPayload = {
        base64: cleanBase64,
        filename: file.name,
        page: numPages ?? 1,
        pdf: {
          width: pdfInfo.width,
          height: pdfInfo.height,
        },
        position: {
          x: Number(realX.toFixed(2)),
          y: Number(realY.toFixed(2)),
          width: Number(realW.toFixed(2)),
          height: Number(realH.toFixed(2)),
        },
      };

      onSubmit(payload);
    } catch (err) {
      console.error("Error converting file to base64:", err);
      toast.error("Gagal membaca file PDF");
    }
  };

  // Drag helpers
  const handleDragStart = (x: number, y: number) => {
    setIsDragging(true);
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: x - rect.left - pos.x,
      y: y - rect.top - pos.y,
    };
  };

  const handleDragMove = (x: number, y: number) => {
    if (!isDragging || !containerRef.current) return;

    requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const newX = x - rect.left - dragOffset.current.x;
      const newY = y - rect.top - dragOffset.current.y;

      setPos({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    });
  };

  return (
    <div className="w-full">
      {/* Upload PDF */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {file && (
        <div
          ref={containerRef}
          className="relative w-full border mt-4 touch-none overflow-hidden"
          onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
          onTouchMove={(e) =>
            handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
          }
          onMouseUp={() => setIsDragging(false)}
          onTouchEnd={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={numPages ?? 1}
              width={pdfWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Meterai Drag */}
          <img
            src="/img/meterai.png"
            alt="Meterai"
            className="absolute cursor-move opacity-90 touch-none"
            style={{
              width: meteraiSize,
              height: meteraiSize,
              left: pos.x,
              top: pos.y,
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) =>
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
            }
            draggable={false}
          />
        </div>
      )}
      {file && (
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          Simpan
        </Button>
      )}
    </div>
  );
}
