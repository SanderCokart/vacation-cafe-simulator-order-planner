import { useMemo } from "react"

import { plan, type PlanInput } from "@/lib/planner"
import { roundDishes, usePlanner } from "@/store"

export function usePlanInput(): PlanInput {
  const orders = usePlanner((state) => state.orders)
  const done = usePlanner((state) => state.done)
  const collected = usePlanner((state) => state.collected)
  const spares = usePlanner((state) => state.spares)
  return useMemo(
    () => ({ dishes: roundDishes(orders), done, collected, spares }),
    [orders, done, collected, spares]
  )
}

export function usePlan() {
  const input = usePlanInput()
  return useMemo(() => plan(input), [input])
}
