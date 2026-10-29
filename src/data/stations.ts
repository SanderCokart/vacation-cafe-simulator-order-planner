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
}

// Array order is the order cards appear in. Fixed for now; reordering is on the TODO list.
export const STATIONS: Station[] = [
  { id: "fish", name: "Fish station", phase: "prep" },
  { id: "seafood", name: "Seafood cleaning", phase: "prep" },
  { id: "oyster", name: "Oyster table", phase: "prep" },
  { id: "cutter", name: "Cutter", phase: "prep" },
  { id: "grater", name: "Grater", phase: "prep" },
  { id: "mixer", name: "Mixer", phase: "prep" },
  { id: "doughTable", name: "Dough table", phase: "prep" },
  { id: "pastaMachine", name: "Pasta machine", phase: "prep" },
  { id: "grinder", name: "Coffee grinder", phase: "prep" },
  { id: "toast", name: "Stove · toast", phase: "cook" },
  { id: "pan", name: "Stove · pan", phase: "cook" },
  { id: "pot", name: "Stove · pot", phase: "cook" },
  { id: "oven", name: "Oven", phase: "cook" },
  { id: "pizzaOven", name: "Pizza oven", phase: "cook" },
  { id: "coffee", name: "Coffee machine", phase: "cook" },
]

export const STATION_BY_ID = Object.fromEntries(
  STATIONS.map((station) => [station.id, station])
) as Record<StationId, Station>
