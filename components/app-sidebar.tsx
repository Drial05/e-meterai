"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  Component,
  User,
  ListCheck,
  List,
  Medal,
  ChartColumnBig,
  DownloadCloud,
  UploadCloud,
  Stamp,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavDashboard } from "@/components/nav-dashboard";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useThemeConfig } from "./active-theme";
import { cn } from "@/lib/utils";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/icon.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navDashboard: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutDashboard,
    },
    {
      title: "Upload Dokumen",
      url: "/dashboard/ematerai/sign",
      icon: Stamp,
    },
    // {
    //   title: "Download Dokumen",
    //   url: "/dashboard/ematerai/download",
    //   icon: DownloadCloud,
    // },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="bg-amber-900 dark:bg-amber-900"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavDashboard items={data.navDashboard} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
