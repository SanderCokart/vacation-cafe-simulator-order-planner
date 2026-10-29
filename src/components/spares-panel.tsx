import { Package, Plus, X } from "lucide-react"
import { useMemo, useState, type KeyboardEvent } from "react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  byPickupOrder,
  ITEMS,
  usesOf,
  type Item,
  type ItemId,
} from "@/data/items"
import { useWaves } from "@/hooks/use-waves"
import { isContainer, type Stock } from "@/lib/stock"
import { entriesToStock, usePlanner, type SpareEntry } from "@/store"

const ALL_ITEMS = (Object.entries(ITEMS) as [ItemId, Item][])
  .filter(([, item]) => !item.staple)
  .map(([id, item]) => ({ id, name: item.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const findItems = (query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return ALL_ITEMS.filter((item) =>
    item.name
      .toLowerCase()
      .split(/\s+/)
      .some((word) => word.startsWith(needle))
  ).concat(
    ALL_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) &&
        !item.name
          .toLowerCase()
          .split(/\s+/)
          .some((word) => word.startsWith(needle))
    )
  )
}

/** Charges or count of one spare, editable in place. */
function SpareRow({ entry }: { entry: SpareEntry }) {
  const updateSpare = usePlanner((state) => state.updateSpare)
  const removeSpare = usePlanner((state) => state.removeSpare)
  const [editing, setEditing] = useState(false)
  const container = isContainer(entry.item)
  const uses = usesOf(entry.item)

  const save = (value: string) => {
    const amount = Math.round(Number(value))
    if (Number.isFinite(amount) && amount !== entry.amount) {
      updateSpare(entry.id, container ? Math.min(amount, uses) : amount)
    }
    setEditing(false)
  }

  return (
    <li className="group flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted">
      <span className="min-w-0 flex-1 truncate">{ITEMS[entry.item].name}</span>
      {editing ? (
        <input
          autoFocus
          type="number"
          min={0}
          max={container ? uses : undefined}
          defaultValue={entry.amount}
          aria-label={`${ITEMS[entry.item].name} ${container ? "charges left" : "count"}`}
          onBlur={(event) => save(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
            if (event.key === "Escape") setEditing(false)
          }}
          className="w-14 rounded-md border bg-background px-1.5 py-0.5 text-right tabular-nums outline-none focus:border-ring"
        />
      ) : (
        <button
          title="Click to edit"
          onClick={() => setEditing(true)}
          className="rounded-md px-1.5 py-0.5 text-muted-foreground tabular-nums hover:bg-background hover:text-foreground"
        >
          {container ? `${entry.amount}/${uses}` : `${entry.amount}×`}
        </button>
      )}
      <button
        aria-label={`Remove ${ITEMS[entry.item].name}`}
        title="Remove"
        onClick={() => removeSpare(entry.id)}
        className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  )
}

/** Pick an item with quick search, then enter its charges or count. */
function AddSpare({ onDone }: { onDone: () => void }) {
  const addSpare = usePlanner((state) => state.addSpare)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(0)
  const [item, setItem] = useState<ItemId | null>(null)
  const [amount, setAmount] = useState("")
  const results = useMemo(() => findItems(query).slice(0, 6), [query])

  const choose = (id: ItemId) => {
    setItem(id)
    setAmount(String(isContainer(id) ? usesOf(id) : 1))
  }

  const submit = () => {
    const value = Math.round(Number(amount))
    if (!item || !Number.isFinite(value) || value <= 0) return
    addSpare(item, isContainer(item) ? Math.min(value, usesOf(item)) : value)
    setItem(null)
    setQuery("")
    setAmount("")
  }

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setHighlight((index) => Math.min(results.length - 1, index + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setHighlight((index) => Math.max(0, index - 1))
    } else if (event.key === "Enter" && results[highlight]) {
      event.preventDefault()
      choose(results[highlight].id)
    } else if (event.key === "Escape") {
      onDone()
    }
  }

  if (item) {
    const container = isContainer(item)
    return (
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <span className="min-w-0 flex-1 truncate">{ITEMS[item].name}</span>
        <input
          autoFocus
          type="number"
          min={1}
          max={container ? usesOf(item) : undefined}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && setItem(null)}
          aria-label={container ? "Charges left" : "Count"}
          className="w-14 rounded-md border bg-background px-1.5 py-0.5 text-right tabular-nums outline-none focus:border-ring"
        />
        {container && (
          <span className="text-muted-foreground">/ {usesOf(item)}</span>
        )}
        <Button type="submit" size="xs">
          Add
        </Button>
      </form>
    )
  }

  return (
    <div>
      <input
        autoFocus
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setHighlight(0)
        }}
        onKeyDown={onSearchKey}
        placeholder="Cacao, milk, Chianti bottle…"
        aria-label="Find an item"
        className="w-full rounded-md border bg-background px-2 py-1 outline-none focus:border-ring"
      />
      {results.length > 0 && (
        <ul className="mt-1">
          {results.map((result, index) => (
            <li key={result.id}>
              <button
                onMouseMove={() => setHighlight(index)}
                onClick={() => choose(result.id)}
                className={cn(
                  "w-full rounded-md px-2 py-0.5 text-left",
                  index === highlight && "bg-accent text-accent-foreground"
                )}
              >
                {result.name}
                {isContainer(result.id) && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {usesOf(result.id)} charges
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Everything left on the counter, one row per container or stack. */
/**
 * Leftovers made by this round's work so far, like the second serving from a
 * pot of trofie. They join the editable spares when a new round starts.
 */
function madeThisRound(now: Stock, before: Stock) {
  const made: { item: ItemId; amount: number }[] = []
  for (const [item, amounts] of Object.entries(now) as [ItemId, number[]][]) {
    if (isContainer(item)) {
      const left = [...(before[item] ?? [])]
      for (const amount of amounts) {
        const index = left.indexOf(amount)
        if (index === -1) made.push({ item, amount })
        else left.splice(index, 1)
      }
    } else {
      const sum = (list: number[] = []) =>
        list.reduce((total, amount) => total + amount, 0)
      const extra = sum(amounts) - sum(before[item])
      if (extra > 0) made.push({ item, amount: extra })
    }
  }
  return made.sort((a, b) => byPickupOrder(a.item, b.item))
}

export function SparesPanel() {
  const spares = usePlanner((state) => state.spares)
  const { leftovers } = useWaves()
  const made = madeThisRound(leftovers(), entriesToStock(spares))
  const clearSpares = usePlanner((state) => state.clearSpares)
  const [adding, setAdding] = useState(false)
  const sorted = [...spares].sort(
    (a, b) => byPickupOrder(a.item, b.item) || a.amount - b.amount
  )

  return (
    <section className="rounded-xl border border-dashed p-3 font-sans text-sm">
      <div className="mb-1.5 flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <h2 className="font-serif text-sm font-medium">
          Spares on the counter
        </h2>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ml-auto"
          aria-label="Add spare"
          title="Add spare"
          onClick={() => setAdding((open) => !open)}
        >
          <Plus />
        </Button>
      </div>
      {sorted.length > 0 && (
        <ul className="mb-2">
          {sorted.map((entry) => (
            <SpareRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
      {made.length > 0 && (
        <div className="mb-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Made this round
          </h3>
          <ul title="Kept as spares when you start a new round">
            {made.map(({ item, amount }) => (
              <li key={`${item}:${amount}`} className="flex gap-2 px-1 py-0.5">
                <span className="min-w-0 flex-1 truncate">
                  {ITEMS[item].name}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {isContainer(item)
                    ? `${amount}/${usesOf(item)}`
                    : `${amount}×`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {adding && (
        <div className="mb-2">
          <AddSpare onDone={() => setAdding(false)} />
        </div>
      )}
      {!sorted.length && !made.length && !adding && (
        <p className="mb-1 text-muted-foreground">
          Add leftover milk, cacao, wine and more so the next orders use them
          first.
        </p>
      )}
      {sorted.length > 0 && (
        <Button variant="outline" size="xs" onClick={clearSpares}>
          Clear spares
        </Button>
      )}
    </section>
  )
}
