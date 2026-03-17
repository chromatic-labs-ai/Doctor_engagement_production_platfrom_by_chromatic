"use client";

import { RealtimeRefresh } from "@/components/realtime-refresh";

export function RequestRealtimeRefresh({ requestId }: { requestId: string }) {
  return <RealtimeRefresh topics={[`request:${requestId}`]} />;
}
