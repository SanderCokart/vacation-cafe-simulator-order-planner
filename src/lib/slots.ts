import { slotsFor, usesOf, type Amounts, type ItemId } from "@/data/items"
import { RECIPE_BY_ID, vesselFor, type Vessel } from "@/data/recipes"
import { STATIONS } from "@/data/stations"
import type { Plan } from "@/lib/planner"

/** The game's inventory size. It's fixed and bound to the number keys. */
export const INVENTORY_SLOTS = 10

const slotsOf = (inventory: Amounts) =>
  (Object.entries(inventory) as [ItemId, number][]).reduce(
    (sum, [item, amount]) => sum + slotsFor(item, amount),
    0
  )

const take = (inventory: Amounts, item: ItemId, amount: number) => {
  inventory[item] = Math.max(0, (inventory[item] ?? 0) - amount)
}

const put = (inventory: Amounts, item: ItemId, amount: number) => {
  inventory[item] = (inventory[item] ?? 0) + amount
}

/**
 * The most inventory slots a wave needs at once. It walks the wave in order:
 * gathering, every station in station order, then plating dish by dish.
 *
 * It's deliberately conservative:
 * - Everything a station makes goes straight into the inventory.
 * - Cutting keeps 1 extra slot for the basic table's split stack.
 * - Plated dishes and filled cups take a whole slot each.
 */
export function peakSlots(
  dishes: Record<string, number>,
  wavePlan: Plan,
  spares: Amounts
): number {
  const inventory: Amounts = {}
  for (const line of wavePlan.gather) {
    put(inventory, line.item, line.need * usesOf(line.item))
  }
  // Spares on the counter get picked up when the wave uses them.
  for (const [item, amount] of Object.entries(spares) as [ItemId, number][]) {
    const used = Math.min(amount, wavePlan.demand[item] ?? 0)
    if (used > 0) put(inventory, item, used)
  }

  let peak = slotsOf(inventory)
  const usesCups = wavePlan.tasks.some(
    (task) => task.process.station === "coffee"
  )

  for (const station of STATIONS) {
    const tasks = wavePlan.tasks.filter(
      (task) => task.process.station === station.id
    )
    if (!tasks.length) continue
    const before = slotsOf(inventory)
    if (station.id === "cutter") peak = Math.max(peak, before + 1)
    for (const task of tasks) {
      for (const [input, amount] of Object.entries(task.process.inputs) as [
        ItemId,
        number,
      ][]) {
        take(inventory, input, amount * task.runs)
      }
      put(inventory, task.process.output, task.process.yield * task.runs)
    }
    const cups = station.id === "coffee" && usesCups ? 1 : 0
    peak = Math.max(peak, before + cups, slotsOf(inventory) + cups)
  }

  const recipes = Object.entries(dishes).filter(([, count]) => count > 0)
  const vessels = new Set<Vessel>()
  for (const [recipeId] of recipes) {
    const recipe = RECIPE_BY_ID[recipeId]
    // Coffee is already in its cup from the machine.
    const vessel = recipe && vesselFor(recipe)
    if (vessel && vessel !== "cup") vessels.add(vessel)
  }
  let served = 0
  for (const [recipeId, count] of recipes) {
    const recipe = RECIPE_BY_ID[recipeId]
    if (!recipe) continue
    for (let index = 0; index < count; index++) {
      for (const [item, amount] of Object.entries(recipe.plate) as [
        ItemId,
        number,
      ][]) {
        take(inventory, item, amount)
      }
      served++
      // One stack each of plates and glasses covers any wave.
      peak = Math.max(peak, slotsOf(inventory) + served + vessels.size)
    }
  }
  return peak
}
