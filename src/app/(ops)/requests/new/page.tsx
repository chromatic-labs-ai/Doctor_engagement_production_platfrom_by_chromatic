import { NewRequestForm } from "@/components/new-request-form";
export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-5 md:px-6 md:py-8 lg:px-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Request Intake
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">New Request</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Start a new request, save it as a draft, or submit it when it is ready for production.
        </p>
      </div>
      <NewRequestForm />
    </div>
  );
}
