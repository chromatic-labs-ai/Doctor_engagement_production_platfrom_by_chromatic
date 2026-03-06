"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MenuIcon, LayoutDashboardIcon, PlusCircleIcon, BuildingIcon, LogOutIcon } from "lucide-react";

import { DashboardSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { signOutAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const ICON_MAP: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboardIcon,
  "/requests/new": PlusCircleIcon,
  "/admin/dashboard": LayoutDashboardIcon,
  "/admin/companies": BuildingIcon,
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-muted/40">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          title={title}
          subtitle={subtitle}
          items={items}
          pathname={pathname}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="p-6 pb-4">
                <SheetTitle className="text-base font-bold">Doctor Engagement</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {title}
                </SheetDescription>
              </div>
              <Separator />
              <nav className="flex-1 space-y-1 px-4 py-4">
                {items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = ICON_MAP[item.href] ?? LayoutDashboardIcon;
                  return (
                    <Button
                      key={item.href}
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-3",
                        active && "bg-muted font-semibold"
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
              <div className="p-4">
                <form action={signOutAction}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-muted-foreground"
                  >
                    <LogOutIcon className="size-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">{title}</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
