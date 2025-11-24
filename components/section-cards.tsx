"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import {
  Boxes,
  Database,
  IterationCcw,
  Ligature,
  List,
  TrendingDownIcon,
  TrendingUp,
  TrendingUpIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

import { useUser } from "@/contexts/user-context";
import Spinner from "./spinner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// config warna (sesuai theme atau manual)
const chartConfig = {
  weight: { label: "weight" },
} satisfies ChartConfig;

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0];

    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${fill}`,
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: 12,
        }}
      >
        {/* Nama criteria */}
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Kriteria: {name}</div>
        {/* Nilai weight, dipisah dengan spasi */}
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Bobot: {value}</div>
      </div>
    );
  }
  return null;
}

export default function SectionCards() {
  const { user, loading } = useUser();

  if (loading) return <Spinner />;

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-4">
      {user?.role === "User2" && (
        <>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Success</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                0
              </CardTitle>
              <div className="absolute right-4 top-4">
                <List className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Success
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Not Success</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                0
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Ligature className="size-15" />
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Not Success
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
