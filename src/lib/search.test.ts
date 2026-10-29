import { describe, expect, it } from "vitest"

import { RECIPES } from "@/data/recipes"
import { searchRecipes } from "@/lib/search"

const names = (query: string) =>
  searchRecipes(query).map((recipe) => recipe.name)

describe("searchRecipes", () => {
  it("returns every recipe for an empty query", () => {
    expect(searchRecipes("  ")).toHaveLength(RECIPES.length)
  })

  it("puts name prefixes first", () => {
    expect(names("carb")[0]).toBe("Pasta Carbonara")
    expect(names("tir")[0]).toBe("Tiramisu")
  })

  it("matches word prefixes in any order", () => {
    expect(names("bru tom")[0]).toBe("Tomato Bruschetta")
  })

  it("ignores accents and case", () => {
    expect(names("CAFFE")).toContain("Caffè Macchiato")
  })

  it("matches aliases", () => {
    expect(names("pepperoni")).toEqual(["Spicy Salami Pizza"])
  })

  it("falls back to loose subsequence matching", () => {
    expect(names("qtfmg")).toContain("Pizza Quattro Formaggi")
  })

  it("returns nothing for gibberish", () => {
    expect(names("zzzz")).toEqual([])
  })
})
