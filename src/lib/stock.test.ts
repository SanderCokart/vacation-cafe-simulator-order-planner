import { describe, expect, it } from "vitest"

import { plan } from "@/lib/planner"
import { peakSlots } from "@/lib/slots"
import { nextStock, stockAmounts, take, type Stock } from "@/lib/stock"
import { planWaves } from "@/lib/waves"

describe("take", () => {
  it("uses the emptiest container first", () => {
    expect(take([2, 1], 1)).toEqual({ picked: [1], rest: [2] })
  })

  it("combines partial containers and leaves the rest in the last one", () => {
    expect(take([5, 1, 6], 6)).toEqual({ picked: [1, 5], rest: [6] })
    expect(take([2, 1], 2)).toEqual({ picked: [1, 2], rest: [1] })
  })
})

describe("nextStock", () => {
  it("opens new containers full and keeps the leftover", () => {
    expect(nextStock({}, { milk: 8 }, { milk: 12 })).toEqual({ milk: [4] })
  })

  it("empties partial spares before the new container", () => {
    expect(nextStock({ cacao: [1, 2] }, { cacao: 4 }, { cacao: 4 })).toEqual({
      cacao: [3],
    })
  })

  it("adds up plain counts", () => {
    expect(
      nextStock({ cleanMussels: [3] }, { cleanMussels: 3 }, { cleanMussels: 6 })
    ).toEqual({ cleanMussels: [6] })
  })
})

describe("spares in waves", () => {
  const stock: Stock = { cacao: [1, 2], milk: [2, 1], chiantiBottle: [3] }

  it("counts each partial container as its own slot", () => {
    const dishes = { chocolatePannaCotta: 1 }
    const peak = (spares: Stock) =>
      peakSlots(
        dishes,
        plan({ dishes, done: {}, collected: {}, spares: stockAmounts(spares) }),
        spares
      )
    // Two 1/4 cacaos are 2 slots; one 2/4 cacao is 1.
    expect(peak({ cacao: [1, 1] })).toBe(peak({ cacao: [2] }) + 1)
  })

  it("lists which spares a wave picks up, emptiest first", () => {
    const [wave] = planWaves({
      orders: [{ id: "a", lines: [{ recipeId: "chianti", qty: 2 }] }],
      started: [],
      spares: stock,
    })
    expect(wave.fromSpares).toEqual({ chiantiBottle: [3] })
    expect(wave.plan.gather).toEqual([])
  })
})
