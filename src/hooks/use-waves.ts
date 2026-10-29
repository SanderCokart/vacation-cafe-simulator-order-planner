import { useMemo } from "react"

import { deliveredOrderIds, planWaves, roundLeftovers } from "@/lib/waves"
import { usePlanner } from "@/store"

export function useWaves() {
  const orders = usePlanner((state) => state.orders)
  const started = usePlanner((state) => state.waves)
  const spares = usePlanner((state) => state.spares)
  return useMemo(() => {
    const waves = planWaves({ orders, started, spares })
    const delivered = deliveredOrderIds(orders, waves)
    return {
      waves,
      delivered,
      activeOrders: orders.filter((order) => !delivered.has(order.id)),
      leftovers: () => roundLeftovers(waves, started, spares),
    }
  }, [orders, started, spares])
}
