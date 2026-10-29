import {
  ITEMS,
  usesOf,
  type Amounts,
  type Item,
  type ItemId,
} from "@/data/items"
import { PROCESSES, type Process } from "@/data/processes"
import { RECIPE_BY_ID } from "@/data/recipes"
import { STATIONS, type Station } from "@/data/stations"

export interface PlanInput {
  /** Dish counts to plan for. */
  dishes: Record<string, number>
  /** Completed runs per process id. */
  done: Record<string, number>
  /** Collected items or containers per raw ingredient. */
  collected: Amounts
  /** Spares already in the kitchen from earlier waves or rounds. */
  spares: Amounts
}

export interface ProcessTask {
  process: Process
  runs: number
  done: number
  remaining: number
  /** Batch leftovers once every run is done, e.g. 3 spare espresso shots. */
  spare: number
}

export interface StationCard {
  station: Station
  tasks: ProcessTask[]
  complete: boolean
}

export interface GatherLine {
  item: ItemId
  /** Items or containers to pick up, e.g. 2 milk cartons. */
  need: number
  collected: number
  remaining: number
  /** Uses left over in the last container, e.g. 3 spare milk pours. */
  spare: number
}

export interface Plan {
  demand: Amounts
  tasks: ProcessTask[]
  stationCards: StationCard[]
  gather: GatherLine[]
  gatherComplete: boolean
}

const PRODUCER = new Map<ItemId, Process>(
  PROCESSES.map((process) => [process.output, process])
)

export const isRaw = (item: ItemId) => !PRODUCER.has(item)

const isStaple = (item: ItemId) => (ITEMS[item] as Item).staple === true

/** Processes ordered so every consumer comes before the processes it consumes from. */
const CONSUMERS_FIRST: Process[] = (() => {
  const consumers = new Map<string, number>()
  for (const process of PROCESSES) {
    for (const input of Object.keys(process.inputs) as ItemId[]) {
      const producer = PRODUCER.get(input)
      if (producer)
        consumers.set(producer.id, (consumers.get(producer.id) ?? 0) + 1)
    }
  }
  const ready = PROCESSES.filter((process) => !consumers.get(process.id))
  const ordered: Process[] = []
  while (ready.length) {
    const process = ready.shift()!
    ordered.push(process)
    for (const input of Object.keys(process.inputs) as ItemId[]) {
      const producer = PRODUCER.get(input)
      if (!producer) continue
      const left = consumers.get(producer.id)! - 1
      consumers.set(producer.id, left)
      if (left === 0) ready.push(producer)
    }
  }
  if (ordered.length !== PROCESSES.length) {
    throw new Error("Process graph has a cycle")
  }
  return ordered
})()

const add = (amounts: Amounts, item: ItemId, amount: number) => {
  amounts[item] = (amounts[item] ?? 0) + amount
}

export function plan({ dishes, done, collected, spares }: PlanInput): Plan {
  const demand: Amounts = {}
  for (const [recipeId, count] of Object.entries(dishes)) {
    const recipe = RECIPE_BY_ID[recipeId]
    if (!recipe || count <= 0) continue
    for (const [item, amount] of Object.entries(recipe.plate) as [
      ItemId,
      number,
    ][]) {
      add(demand, item, amount * count)
    }
  }

  const tasks: ProcessTask[] = []
  for (const process of CONSUMERS_FIRST) {
    const need = demand[process.output] ?? 0
    const carried = spares[process.output] ?? 0
    const runs = Math.ceil(Math.max(0, need - carried) / process.yield)
    for (const [input, amount] of Object.entries(process.inputs) as [
      ItemId,
      number,
    ][]) {
      add(demand, input, amount * runs)
    }
    if (runs === 0) continue
    const doneRuns = Math.min(done[process.id] ?? 0, runs)
    tasks.push({
      process,
      runs,
      done: doneRuns,
      remaining: runs - doneRuns,
      spare: carried + runs * process.yield - need,
    })
  }

  const stationCards: StationCard[] = STATIONS.flatMap((station) => {
    const stationTasks = tasks
      .filter((task) => task.process.station === station.id)
      .sort((a, b) => a.process.label.localeCompare(b.process.label))
    if (!stationTasks.length) return []
    return [
      {
        station,
        tasks: stationTasks,
        complete: stationTasks.every((task) => task.remaining === 0),
      },
    ]
  })

  const gather: GatherLine[] = (Object.entries(demand) as [ItemId, number][])
    .filter(([item, uses]) => isRaw(item) && !isStaple(item) && uses > 0)
    .map(([item, uses]) => {
      const carried = spares[item] ?? 0
      const need = Math.ceil(Math.max(0, uses - carried) / usesOf(item))
      const got = Math.min(collected[item] ?? 0, need)
      return {
        item,
        need,
        collected: got,
        remaining: need - got,
        spare: carried + need * usesOf(item) - uses,
      }
    })
    .filter((line) => line.need > 0)
    .sort((a, b) => ITEMS[a.item].name.localeCompare(ITEMS[b.item].name))

  return {
    demand,
    tasks,
    stationCards,
    gather,
    gatherComplete: gather.every((line) => line.remaining === 0),
  }
}

/**
 * Spares left in the kitchen afterwards: batch and container leftovers plus
 * carried spares that weren't used. With `projected`, assumes every planned
 * run and pickup happens; otherwise counts only what was actually done.
 */
export function leftoverSpares(input: PlanInput, projected = false): Amounts {
  const { demand, tasks, gather } = plan(input)
  const made = new Map<ItemId, number>()
  for (const task of tasks) {
    const runs = projected ? task.runs : task.done
    made.set(task.process.output, runs * task.process.yield)
  }
  for (const line of gather) {
    made.set(
      line.item,
      (projected ? line.need : line.collected) * usesOf(line.item)
    )
  }

  const tracked = new Set<ItemId>(Object.keys(input.spares) as ItemId[])
  for (const process of PROCESSES) {
    if (process.yield > 1) tracked.add(process.output)
  }
  for (const item of Object.keys(ITEMS) as ItemId[]) {
    if (usesOf(item) > 1) tracked.add(item)
  }

  const leftover: Amounts = {}
  for (const item of tracked) {
    const left =
      (input.spares[item] ?? 0) + (made.get(item) ?? 0) - (demand[item] ?? 0)
    if (left > 0) leftover[item] = left
  }
  return leftover
}
