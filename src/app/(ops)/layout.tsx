import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function OpsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole("ops");
  return (
    <DashboardShell
      title="Ops Portal"
      subtitle={profile.full_name || profile.email}
      items={[
        { href: "/dashboard", label: "Dashboard" },
        { href: "/requests/new", label: "New Request" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
