import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,40vw)]">
      <div className="flex flex-col gap-6 px-5 py-6 md:px-8 md:py-8 lg:px-12">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-[0.04em]">Doctor Engagement</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center py-8 lg:py-12">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden border-l bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="px-10 pt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
            Storytelling Platform
          </p>
        </div>
        <div className="flex flex-1 items-center px-10 py-16 xl:px-16">
          <div className="max-w-md space-y-8">
            <div className="h-px w-14 bg-primary-foreground/25" />
            <blockquote className="text-3xl font-semibold leading-tight tracking-[-0.03em] xl:text-4xl">
            "From script to screen — every doctor's story, told right."
            </blockquote>
            <p className="text-base leading-7 text-primary-foreground/70">
              A platform built for pharma teams who care about quality, compliance, and getting it
              done on time.
            </p>
            <div className="h-px w-14 bg-primary-foreground/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
