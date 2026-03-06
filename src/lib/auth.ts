import { redirect } from "next/navigation";

import { Profile, UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAndProfile(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    redirect("/login");
  }

  return { userId: user.id, profile };
}

export async function requireRole(role: UserRole) {
  const { profile } = await getCurrentUserAndProfile();
  if (profile.role !== role) {
    redirect(role === "admin" ? "/dashboard" : "/admin/dashboard");
  }
  return profile;
}
