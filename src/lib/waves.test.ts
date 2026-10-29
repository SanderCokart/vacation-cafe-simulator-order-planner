import { describe, expect, it } from "vitest"

import { plan } from "@/lib/planner"
import { INVENTORY_SLOTS, peakSlots } from "@/lib/slots"
import {
  deliveredOrderIds,
  planWaves,
  roundLeftovers,
  type StartedWave,
  type WaveInput,
} from "@/lib/waves"

const order = (id: string, lines: Record<string, number>) => ({
  id,
  lines: Object.entries(lines).map(([recipeId, qty]) => ({ recipeId, qty })),
})

const waves = (input: Partial<WaveInput>) =>
  planWaves({ orders: [], started: [], spares: {}, ...input })

const peakOf = (dishes: Record<string, number>) =>
  peakSlots(dishes, plan({ dishes, done: {}, collected: {}, spares: {} }), {})

const total = (result: ReturnType<typeof waves>, recipeId: string) =>
  result
    .flatMap((wave) => wave.dishes)
    .filter((dish) => dish.recipeId === recipeId)
    .reduce((sum, dish) => sum + dish.qty, 0)

describe("peakSlots", () => {
  it("counts a plated dish and the plate stack", () => {
    // Gather 2 (mozzarella, tomato, basil = 3), cutter +1, plating: dish + plates
    expect(peakOf({ caprese: 1 })).toBe(4)
  })

  it("counts every filled cup as its own slot", () => {
    // 3 filled cups + their cup stack + the 3 leftover ground coffee uses
    expect(peakOf({ espresso: 3 })).toBe(5)
  })

  it("counts milk cartons by container, not by pour", () => {
    const result = plan({
      dishes: { cappuccino: 7 },
      done: {},
      collected: {},
      spares: {},
    })
    expect(result.gather.find((line) => line.item === "milk")).toMatchObject({
      need: 2,
      spare: 5,
    })
  })
})

describe("planWaves", () => {
  it("keeps a small round in one wave", () => {
    const result = waves({ orders: [order("a", { caprese: 2, espresso: 1 })] })
    expect(result).toHaveLength(1)
    expect(result[0].peak).toBeLessThanOrEqual(INVENTORY_SLOTS)
  })

  it("splits a round that doesn't fit in 10 slots", () => {
    const result = waves({ orders: [order("a", { espresso: 12 })] })
    expect(result.length).toBeGreaterThan(1)
    expect(total(result, "espresso")).toBe(12)
    for (const wave of result)
      expect(wave.peak).toBeLessThanOrEqual(INVENTORY_SLOTS)
  })

  it("keeps pasta pot partners in the same wave", () => {
    const result = waves({
      orders: [
        order("a", { carbonara: 1, antipastoMisto: 2 }),
        order("b", { amatriciana: 1, caprese: 3 }),
      ],
    })
    const pastaWaves = result.filter((wave) =>
      wave.dishes.some((dish) =>
        ["carbonara", "amatriciana"].includes(dish.recipeId)
      )
    )
    expect(pastaWaves).toHaveLength(1)
  })

  it("passes batch leftovers on to the next wave", () => {
    const result = waves({ orders: [order("a", { espresso: 12 })] })
    const grinds = result.map(
      (wave) =>
        wave.plan.tasks.find((task) => task.process.id === "groundCoffee")
          ?.runs ?? 0
    )
    expect(grinds.reduce((sum, runs) => sum + runs, 0)).toBe(2)
  })

  it("never changes a started wave when orders are added", () => {
    const started: StartedWave[] = [
      {
        id: "w1",
        dishes: [{ orderId: "a", recipeId: "caprese", qty: 1 }],
        done: {},
        collected: {},
        served: false,
      },
    ]
    const result = waves({
      orders: [order("a", { caprese: 1 }), order("b", { caprese: 2 })],
      started,
    })
    expect(result[0]).toMatchObject({
      id: "w1",
      dishes: [{ orderId: "a", recipeId: "caprese", qty: 1 }],
    })
    expect(result[1].id).toBeNull()
    expect(total(result.slice(1), "caprese")).toBe(2)
  })

  it("drops deleted dishes from a started wave", () => {
    const started: StartedWave[] = [
      {
        id: "w1",
        dishes: [
          { orderId: "a", recipeId: "caprese", qty: 1 },
          { orderId: "b", recipeId: "espresso", qty: 1 },
        ],
        done: {},
        collected: {},
        served: false,
      },
    ]
    const result = waves({ orders: [order("a", { caprese: 1 })], started })
    expect(result).toHaveLength(1)
    expect(result[0].dishes).toEqual([
      { orderId: "a", recipeId: "caprese", qty: 1 },
    ])
  })
})

describe("deliveredOrderIds", () => {
  it("delivers an order once every dish is in a served wave", () => {
    const orders = [
      order("a", { caprese: 1 }),
      order("b", { caprese: 1, espresso: 1 }),
    ]
    const started: StartedWave[] = [
      {
        id: "w1",
        dishes: [
          { orderId: "a", recipeId: "caprese", qty: 1 },
          { orderId: "b", recipeId: "caprese", qty: 1 },
        ],
        done: {},
        collected: {},
        served: true,
      },
    ]
    const result = waves({ orders, started })
    expect([...deliveredOrderIds(orders, result)]).toEqual(["a"])
  })
})

describe("roundLeftovers", () => {
  it("keeps leftovers only from work that was done", () => {
    const orders = [order("a", { espresso: 3 })]
    const started: StartedWave[] = [
      {
        id: "w1",
        dishes: [{ orderId: "a", recipeId: "espresso", qty: 3 }],
        done: { groundCoffee: 1 },
        collected: { coffeeBeans: 1 },
        served: true,
      },
    ]
    const result = waves({ orders, started })
    expect(roundLeftovers(result, started, {})).toEqual({ groundCoffee: 3 })
  })
})
