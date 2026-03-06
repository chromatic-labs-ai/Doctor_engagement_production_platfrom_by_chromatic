import Link from "next/link";
import {
  PlusCircleIcon,
  ActivityIcon,
  CheckCircle2Icon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RequestRow } from "@/lib/types";

export default async function OpsDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const params = (await searchParams) || {};
  const query = params.q?.trim() ?? "";
  const status = params.status?.trim() ?? "all";
  const { profile } = await getCurrentUserAndProfile();
  const supabase = await createClient();

  let requestQuery = supabase
    .from("requests")
    .select("*")
    .eq("company_id", profile.company_id!)
    .order("created_at", { ascending: false });

  if (query) {
    requestQuery = requestQuery.ilike("doctor_name", `%${query}%`);
  }
  if (status && status !== "all") {
    requestQuery = requestQuery.eq("status", status);
  }

  const { data: requests } = await requestQuery.returns<RequestRow[]>();

  const totalRequests = requests?.length ?? 0;
  const deliveredCount =
    requests?.filter((r) => r.status === "video_delivered").length ?? 0;
  const inReviewCount =
    requests?.filter(
      (r) => r.status === "storyboard_review" || r.status === "changes_requested",
    ).length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your doctor engagement pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/requests/new">
              <PlusCircleIcon className="mr-2 size-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ActivityIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <ClockIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inReviewCount}</div>
            <p className="text-xs text-muted-foreground">
              In review or changes requested
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Delivered</CardTitle>
            <CheckCircle2Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">
              Completed deliveries
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[250px]">
              <SearchIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                defaultValue={query}
                name="q"
                className="pl-8"
              />
            </div>
            <form className="flex w-full items-center gap-2 sm:w-auto">
               <div className="relative w-full sm:w-auto">
                 <FilterIcon className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                 <select
                    name="status"
                    defaultValue={status}
                    className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-8 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[180px]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="form_submitted">Form Submitted</option>
                    <option value="storyboard_in_progress">Storyboard In Progress</option>
                    <option value="storyboard_review">Storyboard Review</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="storyboard_approved">Storyboard Approved</option>
                    <option value="video_in_progress">Video In Progress</option>
                    <option value="video_delivered">Video Delivered</option>
                  </select>
               </div>
               <Button variant="secondary" size="sm" type="submit">Apply</Button>
            </form>
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Submitted</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(requests ?? []).map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.doctor_name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/requests/${request.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!requests || requests.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
