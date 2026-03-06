import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Doctor Engagement
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-black px-16 text-white">
        <div className="max-w-sm space-y-6">
          <div className="h-px w-12 bg-white/30" />
          <blockquote className="text-3xl font-black leading-snug tracking-tight">
            "From script to screen — every doctor's story, told right."
          </blockquote>
          <p className="text-sm font-medium text-white/60 leading-relaxed">
            A platform built for pharma teams who care about quality, compliance, and getting it done on time.
          </p>
          <div className="h-px w-12 bg-white/30" />
        </div>
      </div>
    </div>
  );
}
