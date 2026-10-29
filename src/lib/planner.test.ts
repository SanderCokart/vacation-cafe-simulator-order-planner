import { describe, expect, it } from "vitest"

import { leftoverSpares, plan, type PlanInput } from "@/lib/planner"

const input = (overrides: Partial<PlanInput>): PlanInput => ({
  dishes: {},
  done: {},
  collected: {},
  spares: {},
  ...overrides,
})

const task = (result: ReturnType<typeof plan>, id: string) =>
  result.tasks.find((entry) => entry.process.id === id)

const gathered = (result: ReturnType<typeof plan>, item: string) =>
  result.gather.find((line) => line.item === item)?.need

describe("plan", () => {
  it("returns nothing for an empty round", () => {
    const result = plan(input({}))
    expect(result.tasks).toEqual([])
    expect(result.gather).toEqual([])
    expect(result.gatherComplete).toBe(true)
  })

  it("adds shared prep up across dishes", () => {
    const result = plan(
      input({ dishes: { tomatoBruschetta: 2, pestoBruschetta: 1, caprese: 1 } })
    )
    // 2×2 + 1×2 + 1×1 sliced tomatoes
    expect(task(result, "slicedTomato")?.runs).toBe(7)
    expect(gathered(result, "tomato")).toBe(7)
  })

  it("applies batch yields and reports the spare", () => {
    const result = plan(input({ dishes: { tomatoBruschetta: 3 } }))
    const ciabatta = task(result, "breadSlice")
    expect(ciabatta?.runs).toBe(2)
    expect(ciabatta?.spare).toBe(1)
    expect(task(result, "toastedBread")?.runs).toBe(3)
    expect(gathered(result, "ciabatta")).toBe(2)
  })

  it("counts the tiramisu espresso toward ground coffee", () => {
    const result = plan(input({ dishes: { espresso: 8, tiramisu: 1 } }))
    expect(task(result, "espressoShot")?.runs).toBe(9)
    const grind = task(result, "groundCoffee")
    expect(grind?.runs).toBe(2)
    expect(grind?.spare).toBe(3)
    expect(gathered(result, "coffeeBeans")).toBe(2)
  })

  it("boils one pot of pasta for every two pasta dishes", () => {
    const result = plan(
      input({ dishes: { carbonara: 2, amatriciana: 1, creamyShrimpPasta: 1 } })
    )
    expect(task(result, "cookedSpaghetti")?.runs).toBe(2)
    expect(task(result, "spaghetti")?.runs).toBe(2)
    expect(gathered(result, "eggs")).toBe(2 + 2) // dough + carbonara egg
    // 1 in the shrimp sauce, 1 on top
    expect(task(result, "gratedParmesan")?.runs).toBe(2)
  })

  it("uses carried spares before running a process", () => {
    const result = plan(
      input({ dishes: { espresso: 4 }, spares: { groundCoffee: 3 } })
    )
    const grind = task(result, "groundCoffee")
    expect(grind?.runs).toBe(1)
    expect(grind?.spare).toBe(5)
  })

  it("skips a process entirely when spares cover it", () => {
    const result = plan(
      input({ dishes: { espresso: 2 }, spares: { groundCoffee: 3 } })
    )
    expect(task(result, "groundCoffee")).toBeUndefined()
    expect(gathered(result, "coffeeBeans")).toBeUndefined()
  })

  it("only asks for the difference after new orders", () => {
    const result = plan(
      input({
        dishes: { caprese: 6 },
        done: { slicedTomato: 4 },
        collected: { tomato: 4 },
      })
    )
    const slice = task(result, "slicedTomato")
    expect(slice?.remaining).toBe(2)
    expect(slice?.done).toBe(4)
    expect(
      result.gather.find((line) => line.item === "tomato")?.remaining
    ).toBe(2)
  })

  it("drops extra done work silently when orders shrink", () => {
    const result = plan(
      input({ dishes: { caprese: 1 }, done: { slicedTomato: 5 } })
    )
    expect(task(result, "slicedTomato")).toMatchObject({
      runs: 1,
      done: 1,
      remaining: 0,
    })
  })

  it("groups tasks into station cards in station order", () => {
    const result = plan(input({ dishes: { quattroFormaggi: 1, seaBass: 1 } }))
    expect(result.stationCards.map((card) => card.station.id)).toEqual([
      "fish",
      "cutter",
      "grater",
      "mixer",
      "doughTable",
      "oven",
      "pizzaOven",
    ])
    const grater = result.stationCards.find(
      (card) => card.station.id === "grater"
    )
    expect(grater?.tasks.map((entry) => entry.process.label)).toEqual([
      "Parmesan",
      "Pecorino",
    ])
  })

  it("marks a card complete when every task is done", () => {
    const result = plan(
      input({
        dishes: { quattroFormaggi: 1 },
        done: { gratedParmesan: 1, gratedPecorino: 1 },
      })
    )
    const grater = result.stationCards.find(
      (card) => card.station.id === "grater"
    )
    expect(grater?.complete).toBe(true)
  })

  it("builds a capricciosa from four sliced toppings", () => {
    const result = plan(input({ dishes: { capricciosa: 2 } }))
    for (const id of [
      "slicedMozzarella",
      "slicedHam",
      "slicedMushroom",
      "slicedArtichoke",
    ]) {
      expect(task(result, id)?.runs).toBe(2)
    }
    expect(task(result, "pizzaCapricciosa")?.runs).toBe(2)
    expect(gathered(result, "blackOlives")).toBe(2)
    expect(gathered(result, "tomatoSauce")).toBe(2)
  })

  it("cleans mussels and clams in batches of 6", () => {
    const result = plan(input({ dishes: { insalataDiMare: 1 } }))
    for (const id of ["cleanMussels", "cleanClams"]) {
      expect(task(result, id)).toMatchObject({ runs: 1, spare: 3 })
    }
    expect(gathered(result, "mussels")).toBe(6)
    expect(gathered(result, "clams")).toBe(6)
    expect(gathered(result, "shrimp")).toBe(3)
    expect(
      task(plan(input({ dishes: { insalataDiMare: 3 } })), "cleanMussels")
    ).toMatchObject({ runs: 2, spare: 3 })
  })

  it("never puts staples like olive oil on the gather list", () => {
    const result = plan(input({ dishes: { caprese: 2 } }))
    expect(result.demand.oliveOil).toBe(2)
    expect(gathered(result, "oliveOil")).toBeUndefined()
  })

  it("gives wine no prep at all", () => {
    const result = plan(input({ dishes: { chianti: 3 } }))
    expect(result.tasks).toEqual([])
    expect(result.gather).toEqual([])
  })
})

describe("leftoverSpares", () => {
  it("keeps batch leftovers from completed runs", () => {
    expect(
      leftoverSpares(
        input({
          dishes: { espresso: 3, tomatoBruschetta: 1 },
          done: { groundCoffee: 1, breadSlice: 1 },
        })
      )
    ).toEqual({ groundCoffee: 3, breadSlice: 1 })
  })

  it("ignores runs that never happened", () => {
    expect(leftoverSpares(input({ dishes: { espresso: 3 } }))).toEqual({})
  })

  it("keeps unused carried spares", () => {
    expect(leftoverSpares(input({ spares: { cookedSpaghetti: 1 } }))).toEqual({
      cookedSpaghetti: 1,
    })
  })

  it("never keeps spares for single-yield items", () => {
    expect(
      leftoverSpares(
        input({ dishes: { caprese: 1 }, done: { slicedTomato: 1 } })
      )
    ).toEqual({})
  })
})
