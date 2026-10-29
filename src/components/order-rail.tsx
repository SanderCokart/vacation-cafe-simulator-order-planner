import { ChevronRight, Package, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { useState } from "react"
import { cn } from "cn"

import { ConfirmButton } from "@/components/confirm-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ITEMS, type ItemId } from "@/data/items"
import { RECIPE_BY_ID } from "@/data/recipes"
import { useWaves } from "@/hooks/use-waves"
import { orderName, usePlanner, type Order } from "@/store"

function OrderLabel({ order }: { order: Order }) {
  const renameOrder = usePlanner((state) => state.renameOrder)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <input
        autoFocus
        defaultValue={order.label ?? ""}
        placeholder={`Order ${order.number}`}
        aria-label="Table number or name"
        onClick={(event) => event.stopPropagation()}
        onBlur={(event) => {
          renameOrder(order.id, event.target.value)
          setEditing(false)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") setEditing(false)
        }}
        className="w-full min-w-0 rounded-md border bg-background px-1.5 py-0.5 text-sm font-medium outline-none focus:border-ring"
      />
    )
  }

  return (
    <button
      title="Click to set a table number"
      onClick={(event) => {
        event.stopPropagation()
        setEditing(true)
      }}
      className="truncate rounded-md px-1.5 py-0.5 text-left text-sm font-medium hover:bg-muted"
    >
      {orderName(order)}
    </button>
  )
}

function DeleteOrderButton({ order }: { order: Order }) {
  const deleteOrder = usePlanner((state) => state.deleteOrder)
  return (
    <ConfirmButton
      trigger={
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Delete ${orderName(order)}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Trash2 />
        </Button>
      }
      title={`Delete ${orderName(order)}?`}
      description="Its dishes leave the to-do list. This can't be undone."
      confirmLabel="Delete order"
      onConfirm={() => deleteOrder(order.id)}
    />
  )
}

function ActiveOrder({ order, current }: { order: Order; current: boolean }) {
  const { selectOrder, removeDish } = usePlanner.getState()
  return (
    <li
      onClick={() => selectOrder(order.id)}
      className={cn(
        "cursor-pointer rounded-xl border bg-card p-2 transition-colors",
        current
          ? "border-primary ring-2 ring-primary/20"
          : "hover:border-ring/60"
      )}
    >
      <div className="flex items-center gap-1">
        <OrderLabel order={order} />
        {current && <Badge className="ml-auto">Adding</Badge>}
        <span className={cn(!current && "ml-auto")}>
          <DeleteOrderButton order={order} />
        </span>
      </div>
      {order.lines.length === 0 ? (
        <p className="px-1.5 pt-1 font-sans text-xs text-muted-foreground">
          No dishes yet
        </p>
      ) : (
        <ul className="mt-1 font-sans text-sm">
          {order.lines.map((line) => (
            <li
              key={line.recipeId}
              className="group flex items-center gap-2 rounded-md px-1.5 py-0.5 hover:bg-muted"
            >
              <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                {line.qty}×
              </span>
              <span className="min-w-0 flex-1 truncate">
                {RECIPE_BY_ID[line.recipeId]?.name}
              </span>
              <button
                aria-label={`Remove one ${RECIPE_BY_ID[line.recipeId]?.name}`}
                title="Remove one"
                onClick={(event) => {
                  event.stopPropagation()
                  removeDish(order.id, line.recipeId)
                }}
                className="rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function DeliveredOrder({ order }: { order: Order }) {
  const dishes = order.lines.reduce((sum, line) => sum + line.qty, 0)
  return (
    <li className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-muted">
      <span className="min-w-0 flex-1 truncate text-sm">
        {orderName(order)}
      </span>
      <span className="font-sans text-xs text-muted-foreground">
        {dishes} {dishes === 1 ? "dish" : "dishes"}
      </span>
      <DeleteOrderButton order={order} />
    </li>
  )
}

function Spares() {
  const spares = usePlanner((state) => state.spares)
  const clearSpares = usePlanner((state) => state.clearSpares)
  const entries = Object.entries(spares) as [ItemId, number][]
  if (!entries.length) return null
  return (
    <section className="rounded-xl border border-dashed p-3">
      <div className="mb-1.5 flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Spares in the kitchen</h2>
      </div>
      <ul className="mb-2 font-sans text-sm">
        {entries.map(([item, amount]) => (
          <li key={item} className="flex gap-2">
            <span className="w-6 text-muted-foreground tabular-nums">
              {amount}×
            </span>
            {ITEMS[item].name}
          </li>
        ))}
      </ul>
      <Button variant="outline" size="xs" onClick={clearSpares}>
        Clear spares
      </Button>
    </section>
  )
}

export function OrderRail() {
  const orders = usePlanner((state) => state.orders)
  const currentOrderId = usePlanner((state) => state.currentOrderId)
  const newOrder = usePlanner((state) => state.newOrder)
  const newRound = usePlanner((state) => state.newRound)
  const {
    activeOrders: active,
    delivered: deliveredIds,
    leftovers,
  } = useWaves()

  const delivered = orders.filter((order) => deliveredIds.has(order.id))

  return (
    <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-b p-4 md:border-r md:border-b-0">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">
          Orders <span className="text-muted-foreground">{active.length}</span>
        </h2>
        <Button variant="outline" size="sm" onClick={newOrder}>
          <Plus /> New order
        </Button>
      </div>

      {active.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-center font-sans text-sm text-muted-foreground">
          Search for a dish to start your first order.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((order) => (
            <ActiveOrder
              key={order.id}
              order={order}
              current={order.id === currentOrderId}
            />
          ))}
        </ul>
      )}

      {delivered.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group flex w-full items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ChevronRight className="size-4 transition-transform group-data-panel-open:rotate-90" />
            Delivered {delivered.length}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1">
              {delivered.map((order) => (
                <DeliveredOrder key={order.id} order={order} />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Spares />

      <div className="mt-auto pt-2">
        <ConfirmButton
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
            >
              <RotateCcw /> New round
            </Button>
          }
          title="Start a new round?"
          description="This clears all orders and progress. Batch leftovers, like ground coffee, stay as spares."
          confirmLabel="Start new round"
          onConfirm={() => newRound(leftovers())}
        />
      </div>
    </aside>
  )
}
