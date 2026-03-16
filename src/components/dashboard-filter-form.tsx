"use client";

import { FormEvent, ReactNode, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type DashboardFilterFormProps = {
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  submitButtonClassName?: string;
};

export function DashboardFilterForm({
  children,
  className,
  submitLabel = "Apply",
  submitButtonClassName,
}: DashboardFilterFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const [key, rawValue] of formData.entries()) {
      if (typeof rawValue !== "string") {
        continue;
      }

      const value = rawValue.trim();

      if (!value || value === "all") {
        nextParams.delete(key);
        continue;
      }

      nextParams.set(key, value);
    }

    const nextQuery = nextParams.toString();
    const href = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      <Button
        variant="secondary"
        type="submit"
        className={submitButtonClassName}
        disabled={isPending}
      >
        {isPending ? "Applying..." : submitLabel}
      </Button>
    </form>
  );
}
