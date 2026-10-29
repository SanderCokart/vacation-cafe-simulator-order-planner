import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Amounts } from "@/data/items"

export interface OrderLine {
  recipeId: string
  qty: number
}

export interface Order {
  id: string
  number: number
  /** Optional table number or name that replaces "Order N". */
  label?: string
  lines: OrderLine[]
  delivered: boolean
}

interface State {
  orders: Order[]
  currentOrderId: string | null
  nextNumber: number
  done: Record<string, number>
  collected: Amounts
  spares: Amounts
}

interface Actions {
  addDish: (recipeId: string) => void
  removeDish: (orderId: string, recipeId: string) => void
  newOrder: () => void
  selectOrder: (orderId: string) => void
  stepOrder: (delta: 1 | -1) => void
  renameOrder: (orderId: string, label: string) => void
  setDelivered: (orderId: string, delivered: boolean) => void
  deleteOrder: (orderId: string) => void
  setDone: (runs: Record<string, number>) => void
  setCollected: (amounts: Amounts) => void
  newRound: (spares: Amounts) => void
  clearSpares: () => void
}

const emptyRound = {
  orders: [],
  currentOrderId: null,
  nextNumber: 1,
  done: {},
  collected: {},
}

export const orderName = (order: Order) =>
  order.label || `Order ${order.number}`

/** Orders the search field can step through: active ones, in number order. */
export const activeOrders = (orders: Order[]) =>
  orders.filter((order) => !order.delivered)

const createOrder = (number: number): Order => ({
  id: crypto.randomUUID(),
  number,
  lines: [],
  delivered: false,
})

export const usePlanner = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...emptyRound,
      spares: {},

      addDish: (recipeId) =>
        set((state) => {
          let orders = state.orders
          let current = orders.find(
            (order) => order.id === state.currentOrderId && !order.delivered
          )
          let nextNumber = state.nextNumber
          if (!current) {
            current = createOrder(nextNumber++)
            orders = [...orders, current]
          }
          const existing = current.lines.find(
            (line) => line.recipeId === recipeId
          )
          const lines = existing
            ? current.lines.map((line) =>
                line === existing ? { ...line, qty: line.qty + 1 } : line
              )
            : [...current.lines, { recipeId, qty: 1 }]
          const updated = { ...current, lines }
          return {
            orders: orders.map((order) =>
              order.id === updated.id ? updated : order
            ),
            currentOrderId: updated.id,
            nextNumber,
          }
        }),

      removeDish: (orderId, recipeId) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id !== orderId
              ? order
              : {
                  ...order,
                  lines: order.lines
                    .map((line) =>
                      line.recipeId === recipeId
                        ? { ...line, qty: line.qty - 1 }
                        : line
                    )
                    .filter((line) => line.qty > 0),
                }
          ),
        })),

      newOrder: () =>
        set((state) => {
          const current = state.orders.find(
            (order) => order.id === state.currentOrderId
          )
          // Don't stack up empty orders when Shift+Enter is pressed twice.
          if (current && !current.delivered && current.lines.length === 0)
            return {}
          const order = createOrder(state.nextNumber)
          return {
            orders: [...state.orders, order],
            currentOrderId: order.id,
            nextNumber: state.nextNumber + 1,
          }
        }),

      selectOrder: (orderId) => set({ currentOrderId: orderId }),

      stepOrder: (delta) => {
        const { orders, currentOrderId } = get()
        const active = activeOrders(orders)
        if (!active.length) return
        const index = active.findIndex((order) => order.id === currentOrderId)
        const next =
          index === -1
            ? delta === 1
              ? 0
              : active.length - 1
            : Math.min(active.length - 1, Math.max(0, index + delta))
        set({ currentOrderId: active[next].id })
      },

      renameOrder: (orderId, label) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, label: label.trim() || undefined }
              : order
          ),
        })),

      setDelivered: (orderId, delivered) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, delivered } : order
          ),
          currentOrderId:
            delivered && state.currentOrderId === orderId
              ? null
              : state.currentOrderId,
        })),

      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
          currentOrderId:
            state.currentOrderId === orderId ? null : state.currentOrderId,
        })),

      setDone: (runs) => set((state) => ({ done: { ...state.done, ...runs } })),

      setCollected: (amounts) =>
        set((state) => ({ collected: { ...state.collected, ...amounts } })),

      newRound: (spares) => set({ ...emptyRound, spares }),

      clearSpares: () => set({ spares: {} }),
    }),
    { name: "vacation-cafe-planner", version: 1 }
  )
)

/** Dish totals across every order in the round, delivered ones included. */
export function roundDishes(orders: Order[]): Record<string, number> {
  const dishes: Record<string, number> = {}
  for (const order of orders) {
    for (const line of order.lines) {
      dishes[line.recipeId] = (dishes[line.recipeId] ?? 0) + line.qty
    }
  }
  return dishes
}
