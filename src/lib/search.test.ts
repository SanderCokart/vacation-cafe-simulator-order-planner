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
    expect(names("bru tom")[0]).toBe("Bruschetta with Tomatoes")
  })

  it("ignores accents and case", () => {
    expect(names("CAFFE")).toContain("Caffè Macchiato")
  })

  it("matches aliases", () => {
    expect(names("pepperoni")).toEqual(["Salami Piccante"])
  })

  it("falls back to loose subsequence matching", () => {
    expect(names("qtfmg")).toContain("Quattro Formaggi Pizza")
  })

  it("returns nothing for gibberish", () => {
    expect(names("zzzz")).toEqual([])
  })

  it("puts an exact name above longer names that start the same", () => {
    expect(names("croissant")[0]).toBe("Croissant")
    expect(names("espresso")[0]).toBe("Espresso")
  })

  it("ranks the start of the name above a word later in the name", () => {
    expect(names("pasta").slice(0, 3)).toEqual([
      "Pasta Carbonara",
      "Pasta all'Amatriciana",
      "Creamy Shrimp Pasta",
    ])
  })

  it("ranks whole words above partial words", () => {
    expect(names("mare")[0]).toBe("Insalata di Mare")
    expect(names("pesto")[0]).toBe("Trofie al Pesto")
  })

  it("prefers the shorter name among equal matches", () => {
    expect(names("cap").slice(0, 3)).toEqual([
      "Cappuccino",
      "Caprese Salad",
      "Capricciosa Pizza",
    ])
  })

  it("keeps scattered-letter matches last", () => {
    const result = names("cr")
    expect(result.indexOf("Croissant")).toBeLessThan(
      result.indexOf("Pasta Carbonara")
    )
  })
})
