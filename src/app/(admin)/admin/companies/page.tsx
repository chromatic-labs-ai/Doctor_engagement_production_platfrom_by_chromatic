import { createCompanyWithOpsAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from("companies")
    .select("id,name,created_at")
    .order("created_at", { ascending: false });

  const { data: opsProfiles } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("role", "ops");

  const opsCountByCompany = (opsProfiles ?? []).reduce<Record<string, number>>(
    (acc, item) => {
      if (item.company_id) {
        acc[item.company_id] = (acc[item.company_id] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-sm text-muted-foreground">
          Create company accounts and provision ops user credentials.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Company + Ops Login</CardTitle>
          <CardDescription>
            This will create a new company and an associated ops user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCompanyWithOpsAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="company_name" required placeholder="Acme Health" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Ops User Full Name</Label>
              <Input id="full_name" name="full_name" required placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="ops@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="md:col-span-2">
              <SubmitButton type="submit">Create Company</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            {companies?.length ?? 0} companies registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Ops Users</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(companies ?? []).map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{opsCountByCompany[company.id] ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!companies || companies.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No companies created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
