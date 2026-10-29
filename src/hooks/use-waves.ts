import { useMemo } from "react"

import { deliveredOrderIds, planWaves, roundLeftovers } from "@/lib/waves"
import { entriesToStock, usePlanner } from "@/store"

export function useWaves() {
  const orders = usePlanner((state) => state.orders)
  const started = usePlanner((state) => state.waves)
  const spares = usePlanner((state) => state.spares)
  const mode = usePlanner((state) => state.mode)
  return useMemo(() => {
    const stock = entriesToStock(spares)
    const waves = planWaves({ orders, started, spares: stock, mode })
    const delivered = deliveredOrderIds(orders, waves)
    return {
      waves,
      delivered,
      activeOrders: orders.filter((order) => !delivered.has(order.id)),
      leftovers: () => roundLeftovers(waves, started, stock),
    }
  }, [orders, started, spares, mode])
}
