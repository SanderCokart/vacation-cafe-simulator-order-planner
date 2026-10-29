import { ITEMS, type Amounts, type Item, type ItemId } from "@/data/items"
import { PROCESSES, type Process } from "@/data/processes"
import { RECIPE_BY_ID } from "@/data/recipes"
import { STATIONS, type Station } from "@/data/stations"

export interface PlanInput {
  /** Dish counts for every order in the round, delivered ones included. */
  dishes: Record<string, number>
  /** Completed runs per process id. */
  done: Record<string, number>
  /** Collected amount per raw ingredient. */
  collected: Amounts
  /** Spares carried over from earlier rounds. */
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
  need: number
  collected: number
  remaining: number
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
    .filter(([item, need]) => isRaw(item) && !isStaple(item) && need > 0)
    .map(([item, need]) => {
      const got = Math.min(collected[item] ?? 0, need)
      return { item, need, collected: got, remaining: need - got }
    })
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
 * Spares to carry into the next round: batch leftovers from the runs actually
 * done, plus carried spares this round didn't use.
 */
export function leftoverSpares(input: PlanInput): Amounts {
  const { demand, tasks } = plan(input)
  const runsDone = new Map(
    tasks.map((task) => [task.process.output, task.done])
  )
  const leftover: Amounts = {}
  for (const process of PROCESSES) {
    const carried = input.spares[process.output] ?? 0
    if (process.yield === 1 && carried === 0) continue
    const made = (runsDone.get(process.output) ?? 0) * process.yield
    const left = carried + made - (demand[process.output] ?? 0)
    if (left > 0) leftover[process.output] = left
  }
  return leftover
}
