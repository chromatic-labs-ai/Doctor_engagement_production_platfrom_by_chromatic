"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "lucide-react";

import { JsonRecord } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function JsonCopyPanel({ data }: { data: JsonRecord }) {
  const [copied, setCopied] = useState(false);
  const [pretty, setPretty] = useState(true);

  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request JSON</CardTitle>
        <CardAction>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPretty((v) => !v)}
            >
              {pretty ? "Compact" : "Pretty"}
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={async () => {
                await navigator.clipboard.writeText(content);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? (
                <>
                  <CheckIcon /> Copied
                </>
              ) : (
                <>
                  <ClipboardIcon /> Copy
                </>
              )}
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <pre className="max-h-80 overflow-auto rounded-lg bg-muted p-4 font-mono text-xs leading-relaxed">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}
