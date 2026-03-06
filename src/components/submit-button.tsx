"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircleIcon } from "lucide-react";
import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type ButtonProps = ComponentProps<typeof Button>;

export function SubmitButton({ children, className, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} disabled={pending || props.disabled} className={className}>
      {pending && <LoaderCircleIcon className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  );
}
