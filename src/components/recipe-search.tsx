import { Plus, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "cn"

import { Kbd } from "@/components/ui/kbd"
import { RECIPE_BY_ID } from "@/data/recipes"
import { searchRecipes } from "@/lib/search"
import { activeOrders, orderName, usePlanner } from "@/store"

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

export function RecipeSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(0)
  const [open, setOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  const orders = usePlanner((state) => state.orders)
  const currentOrderId = usePlanner((state) => state.currentOrderId)
  const { addDish, removeDish, newOrder, stepOrder, selectOrder } =
    usePlanner.getState()

  const results = useMemo(() => searchRecipes(query), [query])
  const active = activeOrders(orders)
  const current = active.find((order) => order.id === currentOrderId)

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const ctrlK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k"
      const slash = event.key === "/" && !isTyping(event.target)
      if (ctrlK || slash) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${highlight}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [highlight])

  const changeQuery = (value: string) => {
    setQuery(value)
    setHighlight(0)
  }

  const add = (recipeId: string) => {
    addDish(recipeId)
    setLastAdded(recipeId)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.altKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault()
      stepOrder(event.key === "ArrowUp" ? -1 : 1)
      setLastAdded(null)
      return
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setHighlight((index) => Math.min(results.length - 1, index + 1))
        break
      case "ArrowUp":
        event.preventDefault()
        setHighlight((index) => Math.max(0, index - 1))
        break
      case "Enter":
        event.preventDefault()
        if (event.shiftKey) {
          newOrder()
          changeQuery("")
          setLastAdded(null)
        } else if (results[highlight]) {
          add(results[highlight].id)
        }
        break
      case "Backspace":
        event.preventDefault()
        if (!event.ctrlKey && !event.metaKey) {
          changeQuery("")
        } else if (current?.lines.length) {
          // Ctrl+Backspace takes one off the last added dish; plain Backspace never removes.
          const line =
            current.lines.find((entry) => entry.recipeId === lastAdded) ??
            current.lines[current.lines.length - 1]
          removeDish(current.id, line.recipeId)
          setLastAdded(line.recipeId)
        }
        break
      case "Escape":
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex h-10 items-center gap-2 rounded-full border bg-background px-4 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder={`Add a dish to ${current ? orderName(current) : "a new order"}`}
          className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded={open}
          aria-controls="recipe-results"
          aria-activedescendant={
            open ? `recipe-option-${highlight}` : undefined
          }
        />
        <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
      </div>

      {open && (
        <div
          // Keep focus in the input while clicking inside the panel.
          onMouseDown={(event) => event.preventDefault()}
          className="absolute top-12 left-1/2 z-50 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover font-sans text-popover-foreground shadow-lg"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_16rem]">
            <div
              ref={listRef}
              id="recipe-results"
              role="listbox"
              className="max-h-80 overflow-y-auto p-1.5"
            >
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No dish matches “{query}”.
                </p>
              )}
              {results.map((recipe, index) => (
                <button
                  key={recipe.id}
                  id={`recipe-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={index === highlight}
                  onMouseMove={() => setHighlight(index)}
                  onClick={() => add(recipe.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm",
                    index === highlight && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="truncate">{recipe.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {recipe.category}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t bg-muted/40 p-3 sm:border-t-0 sm:border-l">
              <div className="flex flex-wrap gap-1">
                {active.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      selectOrder(order.id)
                      setLastAdded(null)
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs",
                      order.id === currentOrderId
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    {orderName(order)}
                  </button>
                ))}
                <button
                  onClick={() => {
                    newOrder()
                    setLastAdded(null)
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                >
                  <Plus className="size-3" /> New
                </button>
              </div>

              <div className="min-h-24">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {current ? orderName(current) : "New order"}
                </p>
                {!current?.lines.length ? (
                  <p className="text-sm text-muted-foreground">
                    Press Enter to add the highlighted dish.
                  </p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {current.lines.map((line) => (
                      <li
                        key={line.recipeId}
                        className={cn(
                          "flex gap-2 rounded-md px-1.5 py-0.5",
                          line.recipeId === lastAdded && "bg-primary/10"
                        )}
                      >
                        <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                          {line.qty}×
                        </span>
                        <span className="truncate">
                          {RECIPE_BY_ID[line.recipeId]?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t px-3 py-2 text-xs text-muted-foreground">
            <span>
              <Kbd>↵</Kbd> add
            </span>
            <span>
              <Kbd>⇧ ↵</Kbd> next order
            </span>
            <span>
              <Kbd>Alt ↑↓</Kbd> switch order
            </span>
            <span>
              <Kbd>⌫</Kbd> clear
            </span>
            <span>
              <Kbd>Ctrl ⌫</Kbd> remove last
            </span>
            <span>
              <Kbd>Esc</Kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
