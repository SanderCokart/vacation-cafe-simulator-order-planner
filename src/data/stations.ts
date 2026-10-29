export type Phase = "gather" | "prep" | "cook" | "plate"

export const PHASES: Phase[] = ["gather", "prep", "cook", "plate"]

export const PHASE_LABELS: Record<Phase, string> = {
  gather: "Gather",
  prep: "Prep",
  cook: "Cook",
  plate: "Plate",
}

export type StationId =
  | "fish"
  | "seafood"
  | "oyster"
  | "cutter"
  | "grater"
  | "mixer"
  | "doughTable"
  | "pastaMachine"
  | "grinder"
  | "toast"
  | "pan"
  | "pot"
  | "oven"
  | "pizzaOven"
  | "coffee"

export interface Station {
  id: StationId
  name: string
  phase: Exclude<Phase, "gather" | "plate">
  /** How many it works on at once, e.g. the coffee machine brews 2 cups. */
  batch?: number
  /** The batch is a multiplier on one recipe (1× to 5×), not a mix of items. */
  multiplier?: boolean
}

// Array order is the order cards appear in. Fixed for now; reordering is on the TODO list.
export const STATIONS: Station[] = [
  { id: "fish", name: "Fish station", phase: "prep" },
  { id: "seafood", name: "Seafood cleaning", phase: "prep" },
  // Shucks 1×, 2× or 3× servings at a time.
  {
    id: "oyster",
    name: "Oyster table",
    phase: "prep",
    batch: 3,
    multiplier: true,
  },
  { id: "cutter", name: "Cutter", phase: "prep" },
  { id: "grater", name: "Grater", phase: "prep" },
  // The mixer multiplies one recipe's ingredients 1× to 5×.
  { id: "mixer", name: "Mixer", phase: "prep", batch: 5, multiplier: true },
  { id: "doughTable", name: "Dough table", phase: "prep" },
  { id: "pastaMachine", name: "Pasta machine", phase: "prep" },
  { id: "grinder", name: "Coffee grinder", phase: "prep" },
  { id: "toast", name: "Stove · toast", phase: "cook" },
  { id: "pan", name: "Stove · pan", phase: "cook" },
  { id: "pot", name: "Stove · pot", phase: "cook" },
  { id: "oven", name: "Oven", phase: "cook" },
  { id: "pizzaOven", name: "Pizza oven", phase: "cook" },
  { id: "coffee", name: "Coffee machine", phase: "cook", batch: 2 },
]

export const STATION_BY_ID = Object.fromEntries(
  STATIONS.map((station) => [station.id, station])
) as Record<StationId, Station>
