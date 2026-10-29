export interface Item {
  name: string
  /** Always on hand in unlimited supply, so it's never gathered. */
  staple?: boolean
  /** How many fit in one inventory slot. Defaults to 10. */
  stack?: number
  /** Uses per container, e.g. one milk carton pours 6 times. Defaults to 1. */
  uses?: number
  /** Where it's picked up, when that's not the pantry. */
  from?: string
}

export const DEFAULT_STACK = 10

export const usesOf = (item: ItemId) => (ITEMS[item] as Item).uses ?? 1

/** Inventory slots taken by an amount (in uses) of an item. */
export function slotsFor(item: ItemId, amount: number): number {
  if (amount <= 0) return 0
  const { staple, stack = DEFAULT_STACK, uses = 1 } = ITEMS[item] as Item
  if (staple) return 0
  return Math.ceil(Math.ceil(amount / uses) / stack)
}

// Raw ingredients are the items no process produces; they show up on the gather list.
export const ITEMS = {
  // Raw ingredients
  ciabatta: { name: "Ciabatta" },
  tomato: { name: "Tomato" },
  mozzarella: { name: "Mozzarella" },
  gorgonzola: { name: "Gorgonzola" },
  parmesan: { name: "Parmesan" },
  pecorino: { name: "Pecorino" },
  mushroom: { name: "Field mushroom" },
  garlic: { name: "Garlic" },
  guanciale: { name: "Guanciale" },
  ham: { name: "Ham" },
  spicySalami: { name: "Spicy salami" },
  artichoke: { name: "Artichoke" },
  lemon: { name: "Lemon" },
  basil: { name: "Basil" },
  parsley: { name: "Parsley" },
  thyme: { name: "Thyme" },
  arugula: { name: "Arugula" },
  blackOlives: { name: "Black olives" },
  oliveOil: { name: "Olive oil", staple: true },
  pestoSauce: { name: "Pesto sauce" },
  tomatoSauce: { name: "Tomato sauce" },
  flour: { name: "Flour" },
  eggs: { name: "Eggs" },
  freshYeast: { name: "Fresh yeast" },
  milk: { name: "Milk", uses: 6, stack: 1 },
  cream: { name: "Cream" },
  sugar: { name: "Sugar" },
  gelatin: { name: "Gelatin" },
  cacao: { name: "Cacao", uses: 4, stack: 1 },
  glass: { name: "Empty glass", from: "cupboard" },
  mascarpone: { name: "Mascarpone" },
  ladyfingers: { name: "Savoiardi pack" },
  mincedMeat: { name: "Minced meat" },
  shrimp: { name: "Shrimp" },
  mussels: { name: "Mussels" },
  clams: { name: "Clams" },
  oyster: { name: "Oyster" },
  seaBass: { name: "Sea bass" },
  seaBream: { name: "Sea bream (dorada)" },
  beef: { name: "Beef" },
  berrySauce: { name: "Berry sauce" },
  coffeeBeans: { name: "Coffee beans" },
  // Wine bottles come from the rack and pour 5 glasses each.
  vermentinoBottle: {
    name: "Vermentino bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  pinotGrigioBottle: {
    name: "Pinot Grigio bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  barberaBottle: {
    name: "Barbera bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  chiantiBottle: {
    name: "Chianti bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  houseWineBottle: {
    name: "House wine bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  costaRossoBottle: {
    name: "Costa Rosso bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  estateBiancoBottle: {
    name: "Estate Bianco bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  terraToscanaBottle: {
    name: "Terra Toscana bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },
  proseccoBottle: {
    name: "Prosecco bottle",
    uses: 5,
    stack: 1,
    from: "wine rack",
  },

  // Prepped
  breadSlice: { name: "Bruschetta bread" },
  slicedTomato: { name: "Sliced tomato" },
  slicedMozzarella: { name: "Sliced mozzarella" },
  slicedGorgonzola: { name: "Sliced gorgonzola" },
  slicedParmesan: { name: "Sliced parmesan" },
  slicedPecorino: { name: "Sliced pecorino" },
  slicedMushroom: { name: "Sliced mushroom" },
  slicedGarlic: { name: "Sliced garlic" },
  slicedGuanciale: { name: "Sliced guanciale" },
  slicedHam: { name: "Sliced ham" },
  slicedSalami: { name: "Sliced spicy salami" },
  slicedArtichoke: { name: "Sliced artichoke" },
  slicedBeef: { name: "Sliced beef" },
  cutLemon: { name: "Cut lemon" },
  gratedParmesan: { name: "Grated parmesan" },
  gratedPecorino: { name: "Grated pecorino" },
  cleanSeaBass: { name: "Descaled sea bass" },
  cleanSeaBream: { name: "Descaled sea bream" },
  cleanMussels: { name: "Clean mussels" },
  cleanClams: { name: "Clean clams" },
  shuckedOyster: { name: "Oyster serving (3 shucked)" },
  pizzaDough: { name: "Pizza dough" },
  pizzaBase: { name: "Pizza base" },
  croissantDough: { name: "Croissant dough" },
  rawCroissant: { name: "Croissant preform" },
  chocolateFilling: { name: "Chocolate filling" },
  // The game calls it fresh pasta; the id stays for saved progress.
  spaghetti: { name: "Fresh pasta" },
  pastaDough: { name: "Pasta dough" },
  lasagnaSheets: { name: "Sfoglie per lasagne" },
  trofie: { name: "Fresh trofie" },
  mascarponeCream: { name: "Mascarpone cream" },
  // The preform is already in its glass, so it takes a whole slot.
  pannaCottaPreform: { name: "Panna cotta preform", stack: 1 },
  chocolatePannaCottaPreform: {
    name: "Chocolate panna cotta preform",
    stack: 1,
  },
  // The can that feeds the coffee machine.
  groundCoffee: { name: "Ground coffee", uses: 6, stack: 1 },

  // Cooked
  toastedBread: { name: "Toasted bread" },
  toastedShrimp: { name: "Toasted shrimp" },
  mushroomTopping: { name: "Fried mushrooms and garlic" },
  friedGuanciale: { name: "Fried guanciale" },
  amatricianaSauce: { name: "Amatriciana sauce" },
  shrimpSauce: { name: "Shrimp cream sauce" },
  ragu: { name: "Ragù" },
  bechamel: { name: "Béchamel" },
  friedSeafood: { name: "Fried seafood" },
  cookedSpaghetti: { name: "Boiled pasta" },
  cookedTrofie: { name: "Cooked trofie" },
  bakedLasagna: { name: "Baked lasagna" },
  bakedSeaBass: { name: "Baked sea bass" },
  bakedDorada: { name: "Baked dorada" },
  croissant: { name: "Croissant" },
  pizzaMargherita: { name: "Margherita" },
  pizzaSalami: { name: "Spicy salami pizza" },
  pizzaQuattroFormaggi: { name: "Quattro formaggi" },
  pizzaProsciuttoFunghi: { name: "Prosciutto e funghi" },
  pizzaCapricciosa: { name: "Capricciosa" },
  // A filled cup takes a whole slot.
  espressoShot: { name: "Espresso shot", stack: 1 },
  cappuccino: { name: "Cappuccino", stack: 1 },
  macchiato: { name: "Caffè macchiato", stack: 1 },
  marocchino: { name: "Marocchino", stack: 1 },
} satisfies Record<string, Item>

export type ItemId = keyof typeof ITEMS

export type Amounts = Partial<Record<ItemId, number>>

/**
 * Pickup order in the café, left to right, so the pickup list can be walked
 * in one pass. Items not listed here come after, alphabetically.
 */
export const PICKUP_ORDER: ItemId[] = [
  "parmesan",
  "pecorino",
  "gorgonzola",
  "mozzarella",
  "freshYeast",
  "cream",
  "milk",
  "mascarpone",
  "spicySalami",
  "guanciale",
  "ham",
  "beef",
  "mincedMeat",
  "tomato",
  "basil",
  "lemon",
  "mushroom",
  "garlic",
  "parsley",
  "thyme",
  "arugula",
  "ciabatta",
  "flour",
  "tomatoSauce",
  "pestoSauce",
  "sugar",
  "gelatin",
  "berrySauce",
  "eggs",
  "coffeeBeans",
  "artichoke",
  "blackOlives",
  "cacao",
  "ladyfingers",
  "proseccoBottle",
  "chiantiBottle",
  "pinotGrigioBottle",
  "barberaBottle",
  "vermentinoBottle",
  "houseWineBottle",
  "costaRossoBottle",
  "estateBiancoBottle",
  "terraToscanaBottle",
]

const pickupRank = new Map(PICKUP_ORDER.map((item, index) => [item, index]))

/** Sorts items into pickup order, then alphabetically. */
export const byPickupOrder = (a: ItemId, b: ItemId) =>
  (pickupRank.get(a) ?? Infinity) - (pickupRank.get(b) ?? Infinity) ||
  ITEMS[a].name.localeCompare(ITEMS[b].name)
