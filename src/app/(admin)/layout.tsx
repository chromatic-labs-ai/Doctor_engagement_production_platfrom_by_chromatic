import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRole("admin");
  return (
    <DashboardShell
      title="Admin Portal"
      subtitle={profile.full_name || profile.email}
      items={[
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/companies", label: "Companies" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
