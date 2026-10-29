import { Check, Copy, Download, ScrollText, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "cn"

import { ConfirmButton } from "@/components/confirm-button"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePlanner, type LogEntry, type LogKind } from "@/store"

const KIND_TINTS: Record<LogKind, string> = {
  order: "bg-sky-500",
  wave: "bg-teal-500",
  round: "bg-amber-500",
  setting: "bg-violet-500",
}

const time = (at: number) =>
  new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

const toJson = (log: LogEntry[]) =>
  JSON.stringify(
    log.map((entry) => ({ ...entry, time: new Date(entry.at).toISOString() })),
    null,
    2
  )

function exportLog(log: LogEntry[]) {
  const blob = new Blob([toJson(log)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `cafe-log-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/** Every step taken, newest first, to look for optimizations later. */
export function LogSheet() {
  const log = usePlanner((state) => state.log)
  const clearLog = usePlanner((state) => state.clearLog)
  const entries = [...log].reverse()
  const [copied, setCopied] = useState(false)

  const copyLog = async () => {
    try {
      await navigator.clipboard.writeText(toJson(log))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked; the export button still works.
    }
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <ScrollText /> <span className="hidden sm:inline">Log</span>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Log</SheetTitle>
          <SheetDescription>
            Every step you take, with times, to spot where a round can be
            faster.
          </SheetDescription>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!log.length}
              onClick={() => exportLog(log)}
            >
              <Download /> Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!log.length}
              onClick={copyLog}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <ConfirmButton
              trigger={
                <Button variant="ghost" size="sm" disabled={!log.length}>
                  <Trash2 /> Clear log
                </Button>
              }
              title="Clear the log?"
              description="Every logged step is removed. Export it first if you want to keep it."
              confirmLabel="Clear log"
              onConfirm={clearLog}
            />
          </div>
        </SheetHeader>
        <ol className="flex-1 overflow-y-auto px-4 pb-6 font-sans text-sm">
          {!entries.length && (
            <li className="py-10 text-center text-muted-foreground">
              Steps show up here as you add orders and finish cards.
            </li>
          )}
          {entries.map((entry, index) => (
            <li
              key={`${entry.at}-${index}`}
              className="flex gap-3 border-b py-2 last:border-b-0"
            >
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  KIND_TINTS[entry.kind]
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">{entry.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                R{entry.round} · {time(entry.at)}
              </span>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  )
}
