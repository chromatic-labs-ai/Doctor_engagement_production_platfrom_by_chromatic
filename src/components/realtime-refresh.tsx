"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const REFRESH_DEBOUNCE_MS = 300;

export function RealtimeRefresh({ topics }: { topics: string[] }) {
  const router = useRouter();
  const topicsKey = [...new Set(topics.filter(Boolean))].sort().join("|");

  useEffect(() => {
    const uniqueTopics = topicsKey ? topicsKey.split("|") : [];
    if (uniqueTopics.length === 0) {
      return;
    }

    const supabase = createClient();
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const scheduleRefresh = () => {
      if (!isMounted) {
        return;
      }

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        router.refresh();
      }, REFRESH_DEBOUNCE_MS);
    };

    const channels = uniqueTopics.map((topic) =>
      supabase
        .channel(topic, {
          config: { private: true },
        })
        .on("broadcast", { event: "refresh" }, scheduleRefresh),
    );

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted || !session?.access_token) {
        return;
      }

      await supabase.realtime.setAuth(session.access_token);

      for (const channel of channels) {
        channel.subscribe();
      }
    })();

    return () => {
      isMounted = false;

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      for (const channel of channels) {
        void supabase.removeChannel(channel);
      }
    };
  }, [router, topicsKey]);

  return null;
}
