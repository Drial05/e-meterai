"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function getTitleFromPath(path: string): string {
  const segment = path.split("/").filter(Boolean);
  const displaySegments = segment.slice(1);

  // mapping istilah
  const labelMap: Record<string, string> = {
    Alternative: "Kandidat",
    Criteria: "Kriteria",
  };

  return ["Dashboard", ...displaySegments]
    .map(formatSegment)
    .map((s) => labelMap[s] ?? s) // ganti kalau ada di mapping
    .join(" / ");
}

export default function DynamicHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return <SiteHeader title={title} />;
}
