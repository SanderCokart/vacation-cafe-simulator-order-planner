import { RECIPES, type Recipe } from "@/data/recipes"

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const wordsOf = (text: string) => text.split(/[^a-z0-9]+/).filter(Boolean)

/** How tightly the query's letters sit in the name, from 0 to 1; 0 if they don't all appear in order. */
function subsequenceFit(needle: string, haystack: string): number {
  let index = 0
  let start = -1
  for (let position = 0; position < haystack.length; position++) {
    if (haystack[position] !== needle[index]) continue
    if (start === -1) start = position
    index++
    if (index === needle.length) return needle.length / (position - start + 1)
  }
  return 0
}

/**
 * Higher is better; 0 means no match. Ranked from most to least direct:
 * the exact name, the start of the name, a whole word, the start of words,
 * aliases, anywhere in the name, then loosely scattered letters.
 */
function score(recipe: Recipe, query: string): number {
  const name = normalize(recipe.name)
  const words = wordsOf(name)
  const tokens = wordsOf(query)
  const aliases = (recipe.aliases ?? []).map(normalize)
  if (!tokens.length) return 0

  if (name === query) return 1000
  if (aliases.includes(query)) return 950
  if (name.startsWith(query)) return 900
  if (tokens.every((token) => words.includes(token))) return 850

  if (tokens.every((token) => words.some((word) => word.startsWith(token)))) {
    // Prefer names whose first word matches and where whole words match.
    const firstWord = words[0].startsWith(tokens[0]) ? 40 : 0
    const wholeWords = tokens.filter((token) => words.includes(token)).length
    return 700 + firstWord + wholeWords * 10
  }

  if (aliases.some((alias) => alias.startsWith(query))) return 650
  if (name.includes(query)) return 500

  const fit = subsequenceFit(query.replace(/\s+/g, ""), name)
  return fit ? 100 + Math.round(fit * 100) : 0
}

export function searchRecipes(query: string): Recipe[] {
  const normalized = normalize(query.trim())
  if (!normalized) return RECIPES
  return RECIPES.map((recipe) => ({ recipe, score: score(recipe, normalized) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        // Among equal matches, the shorter name is the more direct one.
        a.recipe.name.length - b.recipe.name.length ||
        a.recipe.name.localeCompare(b.recipe.name)
    )
    .map((entry) => entry.recipe)
}
