import type { Amounts } from "@/data/items"
import { leftoverSpares, plan, type Plan } from "@/lib/planner"
import { INVENTORY_SLOTS, peakSlots } from "@/lib/slots"

export interface WaveDish {
  orderId: string
  recipeId: string
  qty: number
}

/** A wave that has started. Its dishes never change after that. */
export interface StartedWave {
  id: string
  dishes: WaveDish[]
  done: Record<string, number>
  collected: Amounts
  served: boolean
}

export interface Wave {
  /** Null while the wave hasn't started and can still be rearranged. */
  id: string | null
  dishes: WaveDish[]
  plan: Plan
  /** Spares on hand when the wave starts. */
  spares: Amounts
  peak: number
  served: boolean
  /** A single dish that needs more than the whole inventory. */
  overfull: boolean
}

export interface WaveInput {
  orders: { id: string; lines: { recipeId: string; qty: number }[] }[]
  started: StartedWave[]
  spares: Amounts
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

/**
 * Splits the round into waves that each fit in the inventory. Started waves
 * stay as they are; the remaining dishes are packed greedily, with batch
 * partners kept together so fewer waves and fewer leftovers are needed.
 */
export function planWaves({ orders, started, spares }: WaveInput): Wave[] {
  const available = new Map<string, number>()
  for (const order of orders) {
    for (const line of order.lines) {
      available.set(key(order.id, line.recipeId), line.qty)
    }
  }

  const waves: Wave[] = []
  let carried = spares

  for (const startedWave of started) {
    // Deleted dishes drop out of a started wave; nothing else changes.
    const dishes = startedWave.dishes.flatMap((dish) => {
      const k = key(dish.orderId, dish.recipeId)
      const qty = Math.min(dish.qty, available.get(k) ?? 0)
      available.set(k, (available.get(k) ?? 0) - qty)
      return qty > 0 ? [{ ...dish, qty }] : []
    })
    if (!dishes.length) continue
    const {
      counts,
      plan: wavePlan,
      peak,
    } = measure(dishes, carried, startedWave)
    waves.push({
      id: startedWave.id,
      dishes,
      plan: wavePlan,
      spares: carried,
      peak,
      served: startedWave.served,
      overfull: false,
    })
    carried = leftoverSpares(
      { dishes: counts, done: {}, collected: {}, spares: carried },
      true
    )
  }

  const queue: { orderId: string; recipeId: string }[] = []
  for (const order of orders) {
    for (const line of order.lines) {
      const left = available.get(key(order.id, line.recipeId)) ?? 0
      for (let index = 0; index < left; index++) {
        queue.push({ orderId: order.id, recipeId: line.recipeId })
      }
    }
  }
  queue.sort((a, b) => {
    const familyA = family(a.recipeId)
    const familyB = family(b.recipeId)
    if (!familyA !== !familyB) return familyA ? -1 : 1
    return (
      familyA.localeCompare(familyB) ||
      a.recipeId.localeCompare(b.recipeId) ||
      a.orderId.localeCompare(b.orderId)
    )
  })

  while (queue.length) {
    let dishes: WaveDish[] = []
    let overfull = false
    for (let index = 0; index < queue.length;) {
      const { orderId, recipeId } = queue[index]
      const candidate = addDish(dishes, orderId, recipeId)
      const fits = measure(candidate, carried).peak <= INVENTORY_SLOTS
      if (fits || !dishes.length) {
        overfull ||= !fits
        dishes = candidate
        queue.splice(index, 1)
        if (overfull) break
      } else {
        index++
      }
    }
    const { counts, plan: wavePlan, peak } = measure(dishes, carried)
    waves.push({
      id: null,
      dishes,
      plan: wavePlan,
      spares: carried,
      peak,
      served: false,
      overfull,
    })
    carried = leftoverSpares(
      { dishes: counts, done: {}, collected: {}, spares: carried },
      true
    )
  }

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
