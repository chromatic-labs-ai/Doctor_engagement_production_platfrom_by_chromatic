import { NextRequest, NextResponse } from "next/server";

import { Profile } from "@/lib/types";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { supabase, response } = await updateSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(
        profile.role === "admin" ? "/admin/dashboard" : "/dashboard",
        request.url,
      ),
    );
  }

  if (pathname.startsWith("/login")) {
    return NextResponse.redirect(
      new URL(
        profile.role === "admin" ? "/admin/dashboard" : "/dashboard",
        request.url,
      ),
    );
  }

  if (profile.role === "ops" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    profile.role === "admin" &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/requests"))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
