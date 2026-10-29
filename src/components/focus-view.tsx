import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react"
import { Fragment, useState } from "react"
import { cn } from "cn"

import { DrinksStrip } from "@/components/drinks-strip"
import { PHASE_ICONS, PHASE_TINTS } from "@/components/phase"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ITEMS, usesOf, type ItemId } from "@/data/items"
import { RECIPE_BY_ID } from "@/data/recipes"
import { PHASE_LABELS, PHASES, type Phase, type Station } from "@/data/stations"
import { useWaves } from "@/hooks/use-waves"
import { INVENTORY_SLOTS } from "@/lib/slots"
import type { PlanMode, Wave, WaveDish } from "@/lib/waves"
import { orderName, usePlanner, type Order, type WavePatch } from "@/store"

interface CardLine {
  key: string
  qty: number
  name: string
  detail?: string
  /** Already-done amount, shown when new orders reopened the card. */
  done?: number
  /** Heading shown above the first line of each section. */
  section?: string
}

interface FocusCard {
  id: string
  phase: Phase
  title: string
  lines: CardLine[]
  complete: boolean
  /** Extra guidance under the title, e.g. how to batch the coffee machine. */
  note?: string
  doneLabel: string
  donePatch: WavePatch
  reopenPatch?: WavePatch
}

const listNames = (amounts: Partial<Record<ItemId, number>>) =>
  (Object.entries(amounts) as [ItemId, number][])
    .map(([item, amount]) =>
      amount > 1 ? `${amount} ${ITEMS[item].name}` : ITEMS[item].name
    )
    .join(", ")

/** Hides lines already finished before new orders reopened the card. */
const openLines = (lines: CardLine[]) => lines.filter((line) => line.qty > 0)

/** Splits a count into batches, e.g. 7 at up to 5× → "5× then 2×". */
const multipliers = (count: number, batch: number) => {
  const rounds = Array.from({ length: Math.floor(count / batch) }, () => batch)
  if (count % batch) rounds.push(count % batch)
  return rounds.map((size) => `${size}×`).join(" then ")
}

/** How to batch a station's work, e.g. "Takes up to 2 at a time: 3 rounds". */
function batchNote(station: Station, tasks: { remaining: number }[]) {
  const { batch, multiplier } = station
  if (!batch || batch < 2) return undefined
  if (multiplier) {
    const rounds = tasks.reduce(
      (sum, task) => sum + Math.ceil(task.remaining / batch),
      0
    )
    if (!rounds) return undefined
    return `One recipe at a time, 1× to ${batch}×: ${rounds} ${rounds === 1 ? "round" : "rounds"}`
  }
  const items = tasks.reduce((sum, task) => sum + task.remaining, 0)
  if (!items) return undefined
  const rounds = Math.ceil(items / batch)
  const single = items % batch === 1 ? ", last one single" : ""
  return `Takes up to ${batch} at a time: ${rounds} ${rounds === 1 ? "round" : "rounds"}${single}`
}

function buildCards(wave: Wave, orders: Order[]): FocusCard[] {
  const { plan } = wave
  const cards: FocusCard[] = []

  if (plan.gather.length) {
    cards.push({
      id: "gather",
      phase: "gather",
      title: "Pantry pickup",
      lines: openLines(
        plan.gather.map((line) => {
          const uses = usesOf(line.item)
          const details = [
            uses > 1 && `${uses} uses each`,
            line.spare > 0 && uses > 1 && `${line.spare} spare`,
          ].filter(Boolean)
          return {
            key: line.item,
            qty: plan.gatherComplete ? line.need : line.remaining,
            name: ITEMS[line.item].name,
            detail: details.join(" · ") || undefined,
            done: line.collected,
          }
        })
      ),
      complete: plan.gatherComplete,
      doneLabel: "Collected",
      donePatch: {
        collected: Object.fromEntries(
          plan.gather.map((line) => [line.item, line.need])
        ),
      },
      reopenPatch: {
        collected: Object.fromEntries(
          plan.gather.map((line) => [line.item, 0])
        ),
      },
    })
  }

  for (const card of plan.stationCards) {
    cards.push({
      id: card.station.id,
      phase: card.station.phase,
      title: card.station.name,
      lines: openLines(
        card.tasks.map((task) => {
          const multiInput = Object.keys(task.process.inputs).length > 1
          const { batch, multiplier } = card.station
          const left = card.complete ? task.runs : task.remaining
          const details = [
            multiplier &&
              batch &&
              left > 0 &&
              `Set to ${multipliers(left, batch)}`,
            multiInput && listNames(task.process.inputs),
            task.process.yield > 1 && `makes ${task.process.yield} each`,
            task.spare > 0 && `${task.spare} spare`,
          ].filter(Boolean)
          return {
            key: task.process.id,
            qty: card.complete ? task.runs : task.remaining,
            name: task.process.label,
            detail: details.join(" · ") || undefined,
            done: task.done,
          }
        })
      ),
      complete: card.complete,
      note: batchNote(card.station, card.tasks),
      doneLabel: "Done",
      donePatch: {
        done: Object.fromEntries(
          card.tasks.map((task) => [task.process.id, task.runs])
        ),
      },
      reopenPatch: {
        done: Object.fromEntries(
          card.tasks.map((task) => [task.process.id, 0])
        ),
      },
    })
  }

  const orderById = new Map(orders.map((order) => [order.id, order]))
  const nameOf = (orderId: string) => {
    const order = orderById.get(orderId)
    return order ? orderName(order) : "Removed order"
  }
  const dishList = (dishes: WaveDish[]) =>
    dishes
      .map((dish) => `${dish.qty} ${RECIPE_BY_ID[dish.recipeId]?.name}`)
      .join(", ")
  const total = (dishes: WaveDish[]) =>
    dishes.reduce((sum, dish) => sum + dish.qty, 0)
  const plated = [...wave.dishes].sort(
    (a, b) =>
      (orderById.get(a.orderId)?.number ?? 0) -
      (orderById.get(b.orderId)?.number ?? 0)
  )
  const drinks = wave.kind === "drinks"
  cards.push({
    id: "serve",
    phase: "plate",
    title: drinks ? "Serve drinks" : "Plate and serve",
    lines: [
      ...plated.map((dish) => {
        const recipe = RECIPE_BY_ID[dish.recipeId]
        return {
          key: `plate:${dish.orderId}:${dish.recipeId}`,
          section: drinks ? "Pour and finish" : "Plate",
          qty: dish.qty,
          name: recipe?.name,
          detail: [`For ${nameOf(dish.orderId)}`, recipe?.serve]
            .filter(Boolean)
            .join(" · "),
        }
      }),
      ...wave.service.putAside.map((group) => ({
        key: `aside:${group.orderId}`,
        section: "Put aside on the counter",
        qty: total(group.dishes),
        name: nameOf(group.orderId),
        detail: `${dishList(group.dishes)} · served when the table is complete`,
      })),
      ...wave.service.serve.map((group) => ({
        key: `serve:${group.orderId}`,
        section: drinks ? "Serve" : "Pick up and serve",
        qty: total(group.dishes) + total(group.fromCounter),
        name: drinks
          ? `${nameOf(group.orderId)} drinks`
          : `${nameOf(group.orderId)} together`,
        detail:
          [
            group.fromCounter.length &&
              `Pick up ${dishList(group.fromCounter)} from the counter`,
            group.trips > 1 &&
              `Too much to carry at once: serve in ${group.trips} trips`,
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
      })),
    ],
    complete: wave.served,
    doneLabel: "Done",
    donePatch: { served: true },
    reopenPatch: { served: false },
  })

  return cards
}

function Lines({ card, large }: { card: FocusCard; large?: boolean }) {
  return (
    <ul
      className={cn(
        "grid gap-x-6 font-sans",
        large ? "gap-y-3" : "gap-y-1 text-sm",
        large &&
          card.phase === "gather" &&
          card.lines.length > 6 &&
          "sm:grid-cols-2"
      )}
    >
      {card.lines.map((line, index) => (
        <Fragment key={line.key}>
          {large &&
            line.section &&
            line.section !== card.lines[index - 1]?.section && (
              <li className="pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase first:pt-0">
                {line.section}
              </li>
            )}
          <li className="flex items-baseline gap-3">
            <span
              className={cn(
                "shrink-0 text-right font-medium tabular-nums",
                large ? "w-10 text-2xl" : "w-6"
              )}
            >
              {line.qty}×
            </span>
            <span className="min-w-0">
              <span className={cn(large && "text-lg")}>{line.name}</span>
              {large && (line.detail || (!card.complete && !!line.done)) && (
                <span className="block text-sm text-muted-foreground">
                  {[
                    line.detail,
                    !card.complete && line.done && `${line.done} already done`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </span>
          </li>
        </Fragment>
      ))}
    </ul>
  )
}

function StationPill({ card }: { card: FocusCard }) {
  const Icon = PHASE_ICONS[card.phase]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-xs font-medium",
        PHASE_TINTS[card.phase]
      )}
    >
      <Icon className="size-3.5" />
      {PHASE_LABELS[card.phase]}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-20 text-center">
      <div className="flex gap-2 text-muted-foreground">
        {PHASES.map((phase) => {
          const Icon = PHASE_ICONS[phase]
          return <Icon key={phase} className="size-6" />
        })}
      </div>
      <h2 className="text-xl font-medium">Start your first order</h2>
      <p className="font-sans text-sm text-muted-foreground">
        Press <Kbd>/</Kbd> or <Kbd>Ctrl K</Kbd>, type a dish and press Enter.
        Your gather, prep, cook and plate lists build themselves.
      </p>
    </div>
  )
}

function WaveStepper({
  waves,
  index,
  onChange,
}: {
  waves: Wave[]
  index: number
  onChange: (index: number) => void
}) {
  const wave = waves[index]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous wave"
        disabled={index === 0}
        onClick={() => onChange(index - 1)}
      >
        <ChevronLeft />
      </Button>
      <h2 className="min-w-28 text-center text-lg font-medium">
        {wave.kind === "drinks" ? "Drinks wave" : "Wave"} {index + 1}{" "}
        <span className="text-muted-foreground">of {waves.length}</span>
      </h2>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next wave"
        disabled={index === waves.length - 1}
        onClick={() => onChange(index + 1)}
      >
        <ChevronRight />
      </Button>
      <span
        className={cn(
          "rounded-full px-2.5 py-0.5 font-sans text-xs tabular-nums",
          wave.overfull
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        )}
        title="The most inventory slots this wave needs at once"
      >
        {wave.overfull && <AlertTriangle className="mr-1 inline size-3" />}
        Up to {wave.peak} of {INVENTORY_SLOTS} slots
      </span>
      {wave.served && (
        <span className="inline-flex items-center gap-1 font-sans text-xs text-primary">
          <Check className="size-3.5" /> Served
        </span>
      )}
      <ModeToggle />
    </div>
  )
}

function ModeToggle() {
  const mode = usePlanner((state) => state.mode)
  const setMode = usePlanner((state) => state.setMode)
  const options: { value: PlanMode; label: string; title: string }[] = [
    {
      value: "table",
      label: "Table priority",
      title: "Finish whole tables first, in order",
    },
    {
      value: "efficient",
      label: "Efficient",
      title: "Pack dishes for the fewest waves",
    },
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Planning mode"
      className="ml-auto inline-flex rounded-full bg-muted p-0.5 font-sans text-xs"
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={mode === option.value}
          title={option.title}
          onClick={() => setMode(option.value)}
          className={cn(
            "rounded-full px-3 py-1 font-medium text-muted-foreground transition-colors",
            mode === option.value && "bg-background text-foreground shadow-xs"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function FocusView() {
  const { waves } = useWaves()
  const orders = usePlanner((state) => state.orders)
  const [chosenWave, setChosenWave] = useState<number | null>(null)
  const [chosenPhase, setChosenPhase] = useState<Phase | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)

  const mode = usePlanner((state) => state.mode)
  const updateWave = usePlanner((state) => state.updateWave)

  if (!waves.length) return <EmptyState />

  const firstOpenWave = Math.max(
    0,
    waves.findIndex((wave) => !wave.served)
  )
  const waveIndex = Math.min(chosenWave ?? firstOpenWave, waves.length - 1)
  const wave = waves[waveIndex]
  const cards = buildCards(wave, orders)

  const waveLabel = `${wave.kind === "drinks" ? "Drinks wave" : "Wave"} ${waveIndex + 1}`
  const summary = (card: FocusCard) =>
    card.lines.map((line) => `${line.qty} ${line.name}`).join(", ")
  const startNote = () =>
    wave.id
      ? []
      : [
          `${waveLabel} started (${mode === "table" ? "table priority" : "efficient"}, up to ${wave.peak} of ${INVENTORY_SLOTS} slots): ${wave.dishes
            .map((dish) => `${dish.qty} ${RECIPE_BY_ID[dish.recipeId]?.name}`)
            .join(", ")}`,
        ]
  const complete = (card: FocusCard) =>
    updateWave(wave, card.donePatch, [
      ...startNote(),
      `${waveLabel} · ${card.title} ${card.doneLabel.toLowerCase()}: ${summary(card)}`,
    ])
  const reopen = (card: FocusCard) =>
    card.reopenPatch &&
    updateWave(wave, card.reopenPatch, [
      `${waveLabel} · ${card.title} reopened`,
    ])

  const goToWave = (index: number) => {
    setChosenWave(index)
    setChosenPhase(null)
    setFocusedId(null)
  }

  const open = (phase: Phase) =>
    cards.filter((card) => card.phase === phase && !card.complete)
  const firstOpenPhase = PHASES.find((phase) => open(phase).length) ?? "plate"
  const phase = chosenPhase ?? firstOpenPhase
  const openCards = open(phase)
  const doneCards = cards.filter(
    (card) => card.phase === phase && card.complete
  )
  const focus = openCards.find((card) => card.id === focusedId) ?? openCards[0]
  const upNext = openCards.filter((card) => card !== focus)
  const nextPhase = PHASES.slice(PHASES.indexOf(phase) + 1).find(
    (p) => open(p).length
  )
  const nextWave = waves.findIndex(
    (candidate, index) => index > waveIndex && !candidate.served
  )

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 md:p-6">
      <WaveStepper waves={waves} index={waveIndex} onChange={goToWave} />
      <DrinksStrip orders={orders} waves={waves} />
      {wave.overfull && (
        <p className="font-sans text-sm text-destructive">
          One dish in this wave needs more than {INVENTORY_SLOTS} slots on its
          own. You'll need to drop something on a counter.
        </p>
      )}

      <Tabs
        value={phase}
        onValueChange={(value) => {
          setChosenPhase(value as Phase)
          setFocusedId(null)
        }}
      >
        <TabsList className="w-full sm:w-fit">
          {PHASES.map((p) => {
            const Icon = PHASE_ICONS[p]
            const count = open(p).length
            return (
              <TabsTrigger key={p} value={p} className="gap-1.5 px-3">
                <Icon />
                {PHASE_LABELS[p]}
                {count > 0 && (
                  <span className="rounded-full bg-muted px-1.5 font-sans text-xs text-muted-foreground tabular-nums">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {focus ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <section className="flex flex-col gap-5 rounded-3xl border bg-card p-6 shadow-xs">
            <div className="flex flex-col items-start gap-2">
              <StationPill card={focus} />
              <h2 className="text-3xl font-medium">{focus.title}</h2>
              {focus.note && (
                <p className="font-sans text-sm text-muted-foreground">
                  {focus.note}
                </p>
              )}
            </div>
            <Lines card={focus} large />
            <Button
              size="lg"
              className="h-12 text-base"
              onClick={() => {
                complete(focus)
                setFocusedId(null)
              }}
            >
              <Check className="size-5" /> {focus.doneLabel}
            </Button>
          </section>

          <aside className="flex flex-col gap-2">
            <h3 className="font-sans text-xs font-medium text-muted-foreground">
              Up next
            </h3>
            {upNext.length === 0 && (
              <p className="font-sans text-sm text-muted-foreground">
                {nextPhase
                  ? `Last ${PHASE_LABELS[phase].toLowerCase()} card.`
                  : "Last card of this wave."}
              </p>
            )}
            {upNext.map((card) => (
              <button
                key={card.id}
                onClick={() => setFocusedId(card.id)}
                className="rounded-xl border bg-card p-3 text-left transition-colors hover:border-ring/60"
              >
                <div className="text-sm font-medium">{card.title}</div>
                <div className="truncate font-sans text-xs text-muted-foreground">
                  {card.lines
                    .map((line) => `${line.qty} ${line.name}`)
                    .join(", ")}
                </div>
              </button>
            ))}
          </aside>
        </div>
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-3xl border border-dashed p-10 text-center">
          <Check className="size-8 text-primary" />
          <h2 className="text-xl font-medium">
            {nextPhase || !wave.served
              ? `${PHASE_LABELS[phase]} is done`
              : `Wave ${waveIndex + 1} is served`}
          </h2>
          {nextPhase ? (
            <Button
              onClick={() => {
                setChosenPhase(nextPhase)
                setFocusedId(null)
              }}
            >
              On to {PHASE_LABELS[nextPhase].toLowerCase()} <ChevronRight />
            </Button>
          ) : (
            nextWave !== -1 && (
              <Button onClick={() => goToWave(nextWave)}>
                On to wave {nextWave + 1} <ChevronRight />
              </Button>
            )
          )}
        </section>
      )}

      {doneCards.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-sans text-xs font-medium text-muted-foreground">
            Done
          </h3>
          <ul className="flex flex-col gap-1">
            {doneCards.map((card) => (
              <li
                key={card.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted"
              >
                <Check className="size-4 shrink-0" />
                <span className="text-sm">{card.title}</span>
                <span className="min-w-0 flex-1 truncate font-sans text-xs">
                  {card.lines
                    .map((line) => `${line.qty} ${line.name}`)
                    .join(", ")}
                </span>
                {card.reopenPatch && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => reopen(card)}
                  >
                    <RotateCcw /> Reopen
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
