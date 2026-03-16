"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MenuIcon,
  LayoutDashboardIcon,
  FilmIcon,
  BuildingIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";

import { DashboardSidebar } from "@/components/sidebar";
import { PushNotificationsButton } from "@/components/push-notifications-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { signOutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const ICON_MAP: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboardIcon,
  "/requests/new": FilmIcon,
  "/admin/dashboard": LayoutDashboardIcon,
  "/admin/companies": BuildingIcon,
  "/supervisor/dashboard": LayoutDashboardIcon,
  "/supervisor/operators": UsersIcon,
};

interface DashboardShellProps {
  title: string;
  subtitle: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  items,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const activeItem =
    items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    items[0];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden md:block">
        <DashboardSidebar
          title={title}
          subtitle={subtitle}
          items={items}
          pathname={pathname}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MenuIcon className="size-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col border-r p-0">
              <div className="space-y-2 border-b px-5 py-5">
                <SheetTitle className="text-base font-semibold tracking-[-0.01em]">
                  Doctor Engagement
                </SheetTitle>
                <SheetDescription className="text-sm leading-6 text-muted-foreground">
                  {title}
                </SheetDescription>
              </div>
              <nav className="flex-1 space-y-2 px-4 py-5">
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
                        "w-full justify-start gap-3 border-border/60",
                        active && "bg-secondary text-secondary-foreground",
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
              <Separator />
              <div className="space-y-2 p-4">
                <PushNotificationsButton />
                <form action={signOutAction}>
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full justify-start gap-3 text-muted-foreground"
                  >
                    <LogOutIcon className="size-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-3 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Doctor Engagement
            </p>
            <p className="truncate text-sm font-semibold tracking-[-0.01em]">
              {activeItem?.label ?? title}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden min-[420px]:block">
              <PushNotificationsButton compact />
            </div>
            <form action={signOutAction}>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <LogOutIcon className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background pb-24 md:pb-0">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/98 px-3 py-3 backdrop-blur md:hidden">
          <div className="grid grid-cols-2 gap-2">
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
                    "h-12 justify-start gap-3 px-3.5",
                    active && "bg-secondary text-secondary-foreground",
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
