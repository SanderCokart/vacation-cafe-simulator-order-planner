import { ITEMS, usesOf, type Amounts, type ItemId } from "@/data/items"

/**
 * Spares on the counter, per item. A container item (milk, cacao, ground
 * coffee, wine) lists each container's charges separately, e.g. cacao
 * [1, 2]; any other item is a plain count, usually a single entry.
 */
export type Stock = Partial<Record<ItemId, number[]>>

export const isContainer = (item: ItemId) => usesOf(item) > 1

export const stockAmounts = (stock: Stock): Amounts => {
  const amounts: Amounts = {}
  for (const [item, entries] of Object.entries(stock) as [ItemId, number[]][]) {
    const total = entries.reduce((sum, amount) => sum + amount, 0)
    if (total > 0) amounts[item] = total
  }
  return amounts
}

/**
 * Takes `amount` of an item from stock, emptiest container first. Returns
 * the containers or count picked up and what stays on the counter.
 */
export function take(entries: number[], amount: number) {
  const sorted = [...entries].filter((entry) => entry > 0).sort((a, b) => a - b)
  const picked: number[] = []
  let left = amount
  while (left > 0 && sorted.length) {
    const entry = sorted.shift()!
    picked.push(entry)
    if (entry > left) sorted.unshift(entry - left)
    left -= entry
  }
  return { picked, rest: sorted }
}

/**
 * The stock after a step that uses `demand` and makes `made`. New containers
 * come in full; spares are used emptiest first, so the leftover sits in the
 * last container opened.
 */
export function nextStock(stock: Stock, demand: Amounts, made: Amounts): Stock {
  const items = new Set([
    ...Object.keys(stock),
    ...Object.keys(made),
  ] as ItemId[])
  const next: Stock = {}
  for (const item of items) {
    const entries = [...(stock[item] ?? [])]
    const madeAmount = made[item] ?? 0
    const used = demand[item] ?? 0
    if (isContainer(item)) {
      const uses = usesOf(item)
      for (let left = madeAmount; left > 0; left -= uses) {
        entries.push(Math.min(uses, left))
      }
      const { rest } = take(entries, used)
      if (rest.length) next[item] = rest
    } else {
      const total =
        entries.reduce((sum, amount) => sum + amount, 0) + madeAmount - used
      if (total > 0) next[item] = [total]
    }
  }
  return next
}

/** "Cacao 1/4" for containers, "3× Clean mussels" otherwise. */
export const describeSpare = (item: ItemId, amount: number) =>
  isContainer(item)
    ? `${ITEMS[item].name} ${amount}/${usesOf(item)}`
    : `${amount}× ${ITEMS[item].name}`
