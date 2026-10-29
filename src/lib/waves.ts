import type { Amounts } from "@/data/items"
import { RECIPE_BY_ID } from "@/data/recipes"
import { leftoverSpares, plan, type Plan } from "@/lib/planner"
import { INVENTORY_SLOTS, peakSlots } from "@/lib/slots"

export interface WaveDish {
  orderId: string
  recipeId: string
  qty: number
}

export type WaveKind = "drinks" | "food"

/** Table priority finishes tables in order; efficient packs for the fewest waves. */
export type PlanMode = "table" | "efficient"

export interface TableGroup {
  orderId: string
  dishes: WaveDish[]
}

/** What to do with a wave's finished dishes, grouped by table. */
export interface Service {
  /** Food for tables that aren't complete yet. */
  putAside: TableGroup[]
  /** Tables served now, with what to pick up from the counter first. */
  serve: (TableGroup & { fromCounter: WaveDish[]; trips: number })[]
}

interface QueuedDish {
  orderId: string
  recipeId: string
}

/** A wave that has started. Its dishes never change after that. */
export interface StartedWave {
  id: string
  /** Missing on waves saved before drinks waves existed. */
  kind?: WaveKind
  dishes: WaveDish[]
  done: Record<string, number>
  collected: Amounts
  served: boolean
}

export interface Wave {
  /** Null while the wave hasn't started and can still be rearranged. */
  id: string | null
  kind: WaveKind
  dishes: WaveDish[]
  plan: Plan
  /** Spares on hand when the wave starts. */
  spares: Amounts
  peak: number
  served: boolean
  /** A single dish that needs more than the whole inventory. */
  overfull: boolean
  service: Service
}

export interface WaveInput {
  orders: { id: string; lines: { recipeId: string; qty: number }[] }[]
  started: StartedWave[]
  spares: Amounts
  mode?: PlanMode
}

const key = (orderId: string, recipeId: string) => `${orderId}\u0000${recipeId}`

const countByRecipe = (dishes: WaveDish[]) => {
  const counts: Record<string, number> = {}
  for (const dish of dishes) {
    counts[dish.recipeId] = (counts[dish.recipeId] ?? 0) + dish.qty
  }
  return counts
}

const addDish = (dishes: WaveDish[], orderId: string, recipeId: string) => {
  const existing = dishes.find(
    (dish) => dish.orderId === orderId && dish.recipeId === recipeId
  )
  if (existing)
    return dishes.map((dish) =>
      dish === existing ? { ...dish, qty: dish.qty + 1 } : dish
    )
  return [...dishes, { orderId, recipeId, qty: 1 }]
}

/**
 * Dishes that share a batch (pasta pots, ciabatta, coffee grinds, seafood)
 * get the same family, so sorting keeps batch partners next to each other.
 */
const familyCache = new Map<string, string>()
function family(recipeId: string): string {
  let cached = familyCache.get(recipeId)
  if (cached === undefined) {
    const single = plan({
      dishes: { [recipeId]: 1 },
      done: {},
      collected: {},
      spares: {},
    })
    cached = single.tasks
      .filter((task) => task.process.yield > 1)
      .map((task) => task.process.id)
      .sort()
      .join("+")
    familyCache.set(recipeId, cached)
  }
  return cached
}

function measure(dishes: WaveDish[], spares: Amounts, progress?: StartedWave) {
  const counts = countByRecipe(dishes)
  const wavePlan = plan({
    dishes: counts,
    done: progress?.done ?? {},
    collected: progress?.collected ?? {},
    spares,
  })
  return { counts, plan: wavePlan, peak: peakSlots(counts, wavePlan, spares) }
}

/** Drinks go out first and on their own; everything else is food. */
export const isDrink = (recipeId: string) => {
  const category = RECIPE_BY_ID[recipeId]?.category
  return category === "Coffee" || category === "Wine"
}

const isCoffee = (recipeId: string) =>
  RECIPE_BY_ID[recipeId]?.category === "Coffee"

/** The coffee machine brews this many cups at once. */
export const COFFEE_BATCH = 2

/** Keys like "food:<orderId>": a table's drinks and food complete separately. */
const tableKey = (kind: WaveKind, orderId: string) => `${kind}:${orderId}`

interface ServeState {
  /** Dishes per table key already in earlier waves. */
  placed: Map<string, number>
  /** Finished dishes per table key waiting on the counter. */
  counter: Map<string, WaveDish[]>
}

const emptyState = (): ServeState => ({ placed: new Map(), counter: new Map() })

const mergeDishes = (into: WaveDish[], dishes: WaveDish[]) => {
  let merged = into
  for (const dish of dishes) {
    for (let index = 0; index < dish.qty; index++) {
      merged = addDish(merged, dish.orderId, dish.recipeId)
    }
  }
  return merged
}

const countDishes = (dishes: WaveDish[]) =>
  dishes.reduce((sum, dish) => sum + dish.qty, 0)

/**
 * Works out what happens to a wave's finished dishes. Food for a table that
 * isn't complete yet goes aside on the counter; once its last dishes are
 * plated, the table is served together. Drinks work the same way in table
 * priority, and are served straight away in efficient mode.
 */
function serveWave(
  dishes: WaveDish[],
  kind: WaveKind,
  state: ServeState,
  orderIds: string[],
  totals: Map<string, number>,
  mode: PlanMode
) {
  const byOrder = orderIds
    .map((orderId) => ({
      orderId,
      dishes: dishes.filter((dish) => dish.orderId === orderId),
    }))
    .filter((group) => group.dishes.length)

  if (kind === "drinks" && mode === "efficient") {
    const serve = byOrder.map((group) => ({
      ...group,
      fromCounter: [],
      trips: 1,
    }))
    return { service: { putAside: [], serve }, fits: true, next: state }
  }

  const next: ServeState = {
    placed: new Map(state.placed),
    counter: new Map(state.counter),
  }
  const service: Service = { putAside: [], serve: [] }
  for (const group of byOrder) {
    const k = tableKey(kind, group.orderId)
    const placed = (next.placed.get(k) ?? 0) + countDishes(group.dishes)
    next.placed.set(k, placed)
    const counter = next.counter.get(k) ?? []
    if (placed >= (totals.get(k) ?? 0)) {
      const load = countDishes(group.dishes) + countDishes(counter)
      service.serve.push({
        ...group,
        fromCounter: counter,
        trips: Math.ceil(load / INVENTORY_SLOTS),
      })
      next.counter.delete(k)
    } else {
      service.putAside.push(group)
      next.counter.set(k, mergeDishes(counter, group.dishes))
    }
  }
  const load = service.serve.reduce(
    (sum, group) =>
      sum + countDishes(group.dishes) + countDishes(group.fromCounter),
    0
  )
  // A single big table may take several trips; several tables must fit at once.
  const fits = service.serve.length <= 1 || load <= INVENTORY_SLOTS
  return { service, fits, next }
}

/**
 * Splits the round into waves that each fit in the inventory. Started waves
 * stay as they are. Drinks for every table come first, then food: in table
 * priority, tables are finished in order; in efficient mode, batch partners
 * are packed together for the fewest waves.
 */
export function planWaves({
  orders,
  started,
  spares,
  mode = "table",
}: WaveInput): Wave[] {
  const orderIds = orders.map((order) => order.id)
  const tableIndex = new Map(orderIds.map((id, index) => [id, index]))
  const available = new Map<string, number>()
  const totals = new Map<string, number>()
  for (const order of orders) {
    for (const line of order.lines) {
      available.set(key(order.id, line.recipeId), line.qty)
      const k = tableKey(isDrink(line.recipeId) ? "drinks" : "food", order.id)
      totals.set(k, (totals.get(k) ?? 0) + line.qty)
    }
  }

  const waves: Wave[] = []
  let carried = spares
  let state = emptyState()

  const push = (
    id: string | null,
    kind: WaveKind,
    dishes: WaveDish[],
    progress: StartedWave | undefined,
    overfull: boolean
  ) => {
    const { counts, plan: wavePlan, peak } = measure(dishes, carried, progress)
    const served = serveWave(dishes, kind, state, orderIds, totals, mode)
    waves.push({
      id,
      kind,
      dishes,
      plan: wavePlan,
      spares: carried,
      peak,
      served: progress?.served ?? false,
      overfull,
      service: served.service,
    })
    state = served.next
    carried = leftoverSpares(
      { dishes: counts, done: {}, collected: {}, spares: carried },
      true
    )
  }

  for (const startedWave of started) {
    // Deleted dishes drop out of a started wave; nothing else changes.
    const dishes = startedWave.dishes.flatMap((dish) => {
      const k = key(dish.orderId, dish.recipeId)
      const qty = Math.min(dish.qty, available.get(k) ?? 0)
      available.set(k, (available.get(k) ?? 0) - qty)
      return qty > 0 ? [{ ...dish, qty }] : []
    })
    if (!dishes.length) continue
    push(startedWave.id, startedWave.kind ?? "food", dishes, startedWave, false)
  }

  const drinks: QueuedDish[] = []
  const food: QueuedDish[] = []
  for (const order of orders) {
    for (const line of order.lines) {
      const left = available.get(key(order.id, line.recipeId)) ?? 0
      for (let index = 0; index < left; index++) {
        ;(isDrink(line.recipeId) ? drinks : food).push({
          orderId: order.id,
          recipeId: line.recipeId,
        })
      }
    }
  }

  const byTable = (a: QueuedDish, b: QueuedDish) =>
    (tableIndex.get(a.orderId) ?? 0) - (tableIndex.get(b.orderId) ?? 0)
  const byFamily = (a: QueuedDish, b: QueuedDish) => {
    const familyA = family(a.recipeId)
    const familyB = family(b.recipeId)
    if (!familyA !== !familyB) return familyA ? -1 : 1
    return (
      familyA.localeCompare(familyB) || a.recipeId.localeCompare(b.recipeId)
    )
  }
  drinks.sort((a, b) => byTable(a, b) || byFamily(a, b))
  food.sort((a, b) =>
    mode === "table"
      ? byTable(a, b) || byFamily(a, b)
      : byFamily(a, b) || byTable(a, b)
  )

  const fitsWave = (candidate: WaveDish[], kind: WaveKind) =>
    measure(candidate, carried).peak <= INVENTORY_SLOTS &&
    serveWave(candidate, kind, state, orderIds, totals, mode).fits

  /** Evens out the coffee count so the machine never brews a single cup it could pair. */
  const pairCoffee = (dishes: WaveDish[], queue: QueuedDish[]) => {
    const coffees = countDishes(
      dishes.filter((dish) => isCoffee(dish.recipeId))
    )
    if (coffees % COFFEE_BATCH === 0) return dishes
    const nextIndex = queue.findIndex((dish) => isCoffee(dish.recipeId))
    if (nextIndex === -1) return dishes
    const { orderId, recipeId } = queue[nextIndex]
    const candidate = addDish(dishes, orderId, recipeId)
    if (fitsWave(candidate, "drinks")) {
      queue.splice(nextIndex, 1)
      return candidate
    }
    if (coffees < COFFEE_BATCH + 1) return dishes
    // No room for a partner: hand one cup to the next wave to pair up there.
    const last = [...dishes].reverse().find((dish) => isCoffee(dish.recipeId))!
    queue.unshift({ orderId: last.orderId, recipeId: last.recipeId })
    return dishes
      .map((dish) => (dish === last ? { ...dish, qty: dish.qty - 1 } : dish))
      .filter((dish) => dish.qty > 0)
  }

  const pack = (queue: QueuedDish[], kind: WaveKind) => {
    while (queue.length) {
      let dishes: WaveDish[] = []
      let overfull = false
      for (let index = 0; index < queue.length;) {
        const { orderId, recipeId } = queue[index]
        const candidate = addDish(dishes, orderId, recipeId)
        const fits = fitsWave(candidate, kind)
        if (fits || !dishes.length) {
          overfull ||= !fits
          dishes = candidate
          queue.splice(index, 1)
          if (overfull) break
        } else {
          index++
        }
      }
      if (kind === "drinks" && !overfull) dishes = pairCoffee(dishes, queue)
      push(null, kind, dishes, undefined, overfull)
    }
  }
  pack(drinks, "drinks")
  pack(food, "food")

  return waves
}

/** Spares to keep for the next round, counting only work that was done. */
export function roundLeftovers(
  waves: Wave[],
  started: StartedWave[],
  spares: Amounts
) {
  let carried = spares
  for (const wave of waves) {
    const progress = started.find((entry) => entry.id === wave.id)
    if (!progress) continue
    carried = leftoverSpares({
      dishes: countByRecipe(wave.dishes),
      done: progress.done,
      collected: progress.collected,
      spares: carried,
    })
  }
  return carried
}

/** Orders whose every dish is in a served wave. */
export function deliveredOrderIds(
  orders: WaveInput["orders"],
  waves: Wave[]
): Set<string> {
  const served = new Map<string, number>()
  for (const wave of waves) {
    if (!wave.served) continue
    for (const dish of wave.dishes) {
      const k = key(dish.orderId, dish.recipeId)
      served.set(k, (served.get(k) ?? 0) + dish.qty)
    }
  }
  return new Set(
    orders
      .filter(
        (order) =>
          order.lines.length > 0 &&
          order.lines.every(
            (line) =>
              (served.get(key(order.id, line.recipeId)) ?? 0) >= line.qty
          )
      )
      .map((order) => order.id)
  )
}
