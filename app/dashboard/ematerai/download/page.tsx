"use client";

import { useState } from "react";
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

export default function SignMateraiPage() {
  const [authorization, setAuthorization] = useState("");
  const [date, setDate] = useState("");
  const [idDokumen, setIdDokumen] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/emeterai/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDokumen,
          authorization,
          date,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        toast.error("Gagal mendownload dokumen", {
          description: err,
          duration: 5000,
          icon: "❌",
        });
        return;
      }

      // ubah response menjadi blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${idDokumen}(stamped).pdf`;
      a.click();
      toast.success("Dokumen berhasil di download", {
        duration: 5000,
        description: "Cek di folder download browser Anda.",
        icon: "✅",
        action: {
          label: "close",
          onClick: () => toast.dismiss(),
        },
      });
    } catch (error) {
      toast.error("Terjadi kesalahan saat mendownload dokumen.", {
        duration: 5000,
        icon: "❌",
        action: {
          label: "close",
          onClick: () => toast.dismiss(),
        },
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-full px-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Masukan Id Dokumen, Authorization dan Date
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="idDokumen" className="py-4">
                ID Dokumen
              </Label>
              <Input
                id="idDokumen"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={idDokumen}
                onChange={(e) => setIdDokumen(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="authorization" className="py-4">
                Authorization
              </Label>
              <Input
                id="authorization"
                placeholder="hmac username=................. algorithm=............"
                value={authorization}
                onChange={(e) => setAuthorization(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date" className="py-4">
                Date
              </Label>
              <Input
                id="date"
                placeholder="Tue, 21 Oct 2025 09:02:00 GMT"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Mengunggah...
                </>
              ) : (
                "Kirim untuk di Materai"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          Pastikan id dokumen sudah benar sebelum dikirim untuk di download.
        </CardFooter>
      </Card>
    </div>
  );
}
