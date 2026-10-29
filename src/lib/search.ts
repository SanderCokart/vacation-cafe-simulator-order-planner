import { RECIPES, type Recipe } from "@/data/recipes"

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const isSubsequence = (needle: string, haystack: string) => {
  let index = 0
  for (const char of haystack) {
    if (char === needle[index]) index++
    if (index === needle.length) return true
  }
  return false
}

/** Lower is better; null means no match. */
function score(recipe: Recipe, query: string): number | null {
  const name = normalize(recipe.name)
  const words = name.split(/[^a-z]+/).filter(Boolean)
  const tokens = query.split(/\s+/).filter(Boolean)
  const aliases = (recipe.aliases ?? []).map(normalize)

  if (name.startsWith(query)) return 0
  if (tokens.every((token) => words.some((word) => word.startsWith(token))))
    return 1
  if (name.includes(query)) return 2
  if (aliases.some((alias) => alias.startsWith(query))) return 3
  if (isSubsequence(query.replace(/\s+/g, ""), name)) return 4
  return null
}

export function searchRecipes(query: string): Recipe[] {
  const normalized = normalize(query.trim())
  if (!normalized) return RECIPES
  return RECIPES.map((recipe) => ({ recipe, score: score(recipe, normalized) }))
    .filter(
      (entry): entry is { recipe: Recipe; score: number } =>
        entry.score !== null
    )
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.recipe)
}
