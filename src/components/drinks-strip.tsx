import { Check, Coffee } from "lucide-react"

import { RECIPE_BY_ID } from "@/data/recipes"
import { isDrink, type Wave } from "@/lib/waves"
import { orderName, type Order } from "@/store"

const summarize = (counts: Map<string, number>) =>
  [...counts]
    .map(([recipeId, qty]) => `${qty} ${RECIPE_BY_ID[recipeId]?.name}`)
    .join(", ")

/** Drinks still to serve across every table, so they can be made in one go. */
export function DrinksStrip({
  orders,
  waves,
}: {
  orders: Order[]
  waves: Wave[]
}) {
  const served = new Map<string, number>()
  for (const wave of waves) {
    if (!wave.served) continue
    for (const dish of wave.dishes) {
      const key = `${dish.orderId}:${dish.recipeId}`
      served.set(key, (served.get(key) ?? 0) + dish.qty)
    }
  }

  let ordered = 0
  const total = new Map<string, number>()
  const perTable: { order: Order; counts: Map<string, number> }[] = []
  for (const order of orders) {
    const counts = new Map<string, number>()
    for (const line of order.lines) {
      if (!isDrink(line.recipeId)) continue
      ordered += line.qty
      const left = line.qty - (served.get(`${order.id}:${line.recipeId}`) ?? 0)
      if (left <= 0) continue
      counts.set(line.recipeId, left)
      total.set(line.recipeId, (total.get(line.recipeId) ?? 0) + left)
    }
    if (counts.size) perTable.push({ order, counts })
  }

  if (!ordered) return null
  if (!total.size) {
    return (
      <p className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
        <Check className="size-3.5 text-primary" /> All drinks served
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border bg-card px-3 py-2 font-sans text-sm">
      <span className="flex items-center gap-1.5 font-medium">
        <Coffee className="size-4 text-muted-foreground" />
        Drinks: {summarize(total)}
      </span>
      {perTable.map(({ order, counts }) => (
        <span
          key={order.id}
          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          {orderName(order)}: {summarize(counts)}
        </span>
      ))}
    </div>
  )
}
