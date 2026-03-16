"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  FilmIcon,
  BuildingIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";

import { signOutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { PushNotificationsButton } from "@/components/push-notifications-button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboardIcon,
  "/requests/new": FilmIcon,
  "/admin/dashboard": LayoutDashboardIcon,
  "/admin/companies": BuildingIcon,
  "/supervisor/dashboard": LayoutDashboardIcon,
  "/supervisor/operators": UsersIcon,
};

interface SidebarItem {
  href: string;
  label: string;
}

interface DashboardSidebarProps {
  title: string;
  subtitle: string;
  items: SidebarItem[];
  pathname: string;
}

export function DashboardSidebar({
  title,
  subtitle,
  items,
  pathname,
}: DashboardSidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-[88px] flex-col border-r bg-sidebar text-sidebar-foreground xl:w-72">
      <div className="border-b px-3 pt-6 pb-5 xl:px-6">
        <div className="flex justify-center xl:hidden">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-sm border bg-primary text-sm font-semibold text-primary-foreground">
            DE
          </div>
        </div>
        <div className="hidden overflow-hidden xl:block">
          <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Doctor Engagement
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.01em] whitespace-nowrap">
            {title}
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = ICON_MAP[item.href] ?? LayoutDashboardIcon;

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              size="default"
              className={cn(
                "h-11 w-full justify-center gap-3 px-0 xl:justify-start xl:border-border/50 xl:px-4",
                active &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/92",
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="size-4" />
                <span className="hidden truncate xl:inline">{item.label}</span>
                <span className="sr-only xl:hidden">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-2 p-3">
        <div className="xl:hidden">
          <PushNotificationsButton compact />
        </div>
        <div className="hidden xl:block">
          <PushNotificationsButton />
        </div>
        <form action={signOutAction}>
          <Button
            variant="outline"
            size="default"
            className="h-11 w-full justify-center px-0 text-muted-foreground xl:justify-start xl:gap-3 xl:px-4"
          >
            <LogOutIcon className="size-4" />
            <span className="hidden xl:inline">Sign Out</span>
            <span className="sr-only xl:hidden">Sign Out</span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
