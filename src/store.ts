import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Amounts } from "@/data/items"
import { RECIPE_BY_ID } from "@/data/recipes"
import type { PlanMode, StartedWave, Wave } from "@/lib/waves"

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
}

export type LogKind = "order" | "wave" | "round" | "setting"

export interface LogEntry {
  /** Milliseconds since epoch. */
  at: number
  round: number
  kind: LogKind
  text: string
}

/** Oldest entries drop off past this, to keep localStorage small. */
const LOG_LIMIT = 5000

interface State {
  orders: Order[]
  currentOrderId: string | null
  nextNumber: number
  /** Waves that have started, in the order they were started. */
  waves: StartedWave[]
  spares: Amounts
  mode: PlanMode
  /** Counts rounds so the log can tell them apart. */
  round: number
  log: LogEntry[]
}

export type WavePatch = Partial<
  Pick<StartedWave, "done" | "collected" | "served">
>

interface Actions {
  addDish: (recipeId: string) => void
  removeDish: (orderId: string, recipeId: string) => void
  newOrder: () => void
  selectOrder: (orderId: string | null) => void
  /** Moves through `orderIds` (the active orders) from the current one. */
  stepOrder: (delta: 1 | -1, orderIds: string[]) => void
  renameOrder: (orderId: string, label: string) => void
  deleteOrder: (orderId: string) => void
  /** Records progress on a wave, starting it first if needed. */
  updateWave: (wave: Wave, patch: WavePatch, notes?: string[]) => void
  newRound: (spares: Amounts) => void
  clearSpares: () => void
  setMode: (mode: PlanMode) => void
  clearLog: () => void
}

const emptyRound = {
  orders: [],
  currentOrderId: null,
  nextNumber: 1,
  waves: [],
}

export const orderName = (order: Order) =>
  order.label || `Order ${order.number}`

const recipeName = (recipeId: string) =>
  RECIPE_BY_ID[recipeId]?.name ?? recipeId

/** Appends log entries; spread the result into a `set` update. */
const logged = (
  state: State,
  kind: LogKind,
  ...texts: string[]
): Pick<State, "log"> => ({
  log: [
    ...state.log,
    ...texts.map((text) => ({
      at: Date.now(),
      round: state.round,
      kind,
      text,
    })),
  ].slice(-LOG_LIMIT),
})

const orderNameById = (orders: Order[], orderId: string) => {
  const order = orders.find((entry) => entry.id === orderId)
  return order ? orderName(order) : "Removed order"
}

const createOrder = (number: number): Order => ({
  id: crypto.randomUUID(),
  number,
  lines: [],
})

export const usePlanner = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...emptyRound,
      spares: {},
      mode: "table",
      round: 1,
      log: [],

      addDish: (recipeId) =>
        set((state) => {
          let orders = state.orders
          let current = orders.find(
            (order) => order.id === state.currentOrderId
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
            ...logged(
              state,
              "order",
              `${orderName(updated)}: added ${recipeName(recipeId)}`
            ),
          }
        }),

      removeDish: (orderId, recipeId) =>
        set((state) => ({
          ...logged(
            state,
            "order",
            `${orderNameById(state.orders, orderId)}: removed ${recipeName(recipeId)}`
          ),
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
          if (current && current.lines.length === 0) return {}
          const order = createOrder(state.nextNumber)
          return {
            orders: [...state.orders, order],
            currentOrderId: order.id,
            nextNumber: state.nextNumber + 1,
            ...logged(state, "order", `New ${orderName(order)}`),
          }
        }),

      selectOrder: (orderId) => set({ currentOrderId: orderId }),

      stepOrder: (delta, orderIds) => {
        if (!orderIds.length) return
        const index = orderIds.indexOf(get().currentOrderId ?? "")
        const next =
          index === -1
            ? delta === 1
              ? 0
              : orderIds.length - 1
            : Math.min(orderIds.length - 1, Math.max(0, index + delta))
        set({ currentOrderId: orderIds[next] })
      },

      renameOrder: (orderId, label) =>
        set((state) => ({
          ...logged(
            state,
            "order",
            `${orderNameById(state.orders, orderId)} renamed to ${label.trim() || "its number"}`
          ),
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, label: label.trim() || undefined }
              : order
          ),
        })),

      deleteOrder: (orderId) =>
        set((state) => ({
          ...logged(
            state,
            "order",
            `Deleted ${orderNameById(state.orders, orderId)}`
          ),
          orders: state.orders.filter((order) => order.id !== orderId),
          waves: state.waves.map((wave) => ({
            ...wave,
            dishes: wave.dishes.filter((dish) => dish.orderId !== orderId),
          })),
          currentOrderId:
            state.currentOrderId === orderId ? null : state.currentOrderId,
        })),

      updateWave: (wave, patch, notes = []) =>
        set((state) => {
          const existing = wave.id
            ? state.waves.find((entry) => entry.id === wave.id)
            : undefined
          const base: StartedWave = existing ?? {
            id: crypto.randomUUID(),
            kind: wave.kind,
            dishes: wave.dishes,
            done: {},
            collected: {},
            served: false,
          }
          const updated: StartedWave = {
            ...base,
            done: { ...base.done, ...patch.done },
            collected: { ...base.collected, ...patch.collected },
            served: patch.served ?? base.served,
          }
          return {
            waves: existing
              ? state.waves.map((entry) =>
                  entry === existing ? updated : entry
                )
              : [...state.waves, updated],
            ...logged(state, "wave", ...notes),
          }
        }),

      newRound: (spares) =>
        set((state) => {
          const kept = Object.keys(spares).length
          return {
            ...emptyRound,
            spares,
            round: state.round + 1,
            ...logged(
              state,
              "round",
              `Round ${state.round} ended${kept ? `, kept ${kept} kinds of spares` : ""}`
            ),
          }
        }),

      clearSpares: () =>
        set((state) => ({
          spares: {},
          ...logged(state, "round", "Cleared spares"),
        })),

      setMode: (mode) =>
        set((state) => ({
          mode,
          ...logged(
            state,
            "setting",
            `Mode set to ${mode === "table" ? "table priority" : "efficient"}`
          ),
        })),

      clearLog: () => set({ log: [] }),
    }),
    {
      name: "vacation-cafe-planner",
      version: 2,
      // Version 1 tracked progress for the whole round; waves start fresh.
      migrate: (persisted, version) => {
        const state = persisted as Partial<State>
        if (version < 2) return { ...state, waves: [] }
        return state
      },
      partialize: ({
        orders,
        currentOrderId,
        nextNumber,
        waves,
        spares,
        mode,
        round,
        log,
      }) => ({
        orders,
        currentOrderId,
        nextNumber,
        waves,
        spares,
        mode,
        round,
        log,
      }),
    }
  )
)
