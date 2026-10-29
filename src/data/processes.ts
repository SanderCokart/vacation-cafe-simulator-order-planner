import type { Amounts, ItemId } from "@/data/items"
import type { StationId } from "@/data/stations"

/**
 * One action at a station. Running it once consumes `inputs` and produces
 * `yield` of `output`. Every intermediate item has exactly one process.
 */
export interface Process {
  id: string
  station: StationId
  label: string
  output: ItemId
  yield: number
  inputs: Amounts
}

const p = (
  station: StationId,
  output: ItemId,
  label: string,
  inputs: Amounts,
  yieldPerRun = 1
): Process => ({
  id: output,
  station,
  label,
  output,
  yield: yieldPerRun,
  inputs,
})

export const PROCESSES: Process[] = [
  // Prep
  p("fish", "cleanSeaBass", "Sea bass", { seaBass: 1 }),
  p("fish", "cleanSeaBream", "Sea bream (dorada)", { seaBream: 1 }),
  // The cleaning station only takes batches of 6 (6, 12 or 18 at a time).
  p("seafood", "cleanMussels", "Mussels (batch of 6)", { mussels: 6 }, 6),
  p("seafood", "cleanClams", "Clams (batch of 6)", { clams: 6 }, 6),
  p("oyster", "shuckedOyster", "Oyster", { oyster: 1 }),
  // 1 ciabatta is cut into 4 pieces; a bruschetta uses 2.
  p("cutter", "breadSlice", "Ciabatta", { ciabatta: 1 }, 2),
  p("cutter", "slicedTomato", "Tomato", { tomato: 1 }),
  p("cutter", "slicedMozzarella", "Mozzarella", { mozzarella: 1 }),
  p("cutter", "slicedGorgonzola", "Gorgonzola", { gorgonzola: 1 }),
  p("cutter", "slicedParmesan", "Parmesan", { parmesan: 1 }),
  p("cutter", "slicedPecorino", "Pecorino", { pecorino: 1 }),
  p("cutter", "slicedMushroom", "Mushroom", { mushroom: 1 }),
  p("cutter", "slicedGarlic", "Garlic", { garlic: 1 }),
  p("cutter", "slicedGuanciale", "Guanciale", { guanciale: 1 }),
  p("cutter", "slicedHam", "Ham", { ham: 1 }),
  p("cutter", "slicedSalami", "Spicy salami", { spicySalami: 1 }),
  p("cutter", "slicedArtichoke", "Artichoke", { artichoke: 1 }),
  p("cutter", "slicedBeef", "Beef", { beef: 1 }),
  p("cutter", "cutLemon", "Lemon", { lemon: 1 }),
  p("grater", "gratedParmesan", "Parmesan", { parmesan: 1 }),
  p("grater", "gratedPecorino", "Pecorino", { pecorino: 1 }),
  p("mixer", "pizzaDough", "Pizza dough", { freshYeast: 1, flour: 1 }),
  // One pasta dough feeds the pasta machine for spaghetti, trofie or sheets.
  p("mixer", "pastaDough", "Pasta dough", { eggs: 2, flour: 1 }),
  p("mixer", "mascarponeCream", "Mascarpone cream", {
    eggs: 1,
    sugar: 1,
    mascarpone: 1,
  }),
  p("mixer", "pannaCottaPreform", "Panna cotta preform", {
    cream: 1,
    sugar: 1,
    gelatin: 1,
    glass: 1,
  }),
  p("mixer", "chocolatePannaCottaPreform", "Chocolate panna cotta preform", {
    cream: 1,
    sugar: 1,
    gelatin: 1,
    glass: 1,
    cacao: 1,
  }),
  // A full milk bottle goes into each croissant dough.
  p("mixer", "croissantDough", "Croissant dough", {
    flour: 1,
    milk: 6,
    eggs: 1,
    freshYeast: 1,
  }),
  p("mixer", "chocolateFilling", "Chocolate filling", {
    eggs: 1,
    sugar: 1,
    cacao: 1,
    mascarpone: 1,
  }),
  p("doughTable", "pizzaBase", "Pizza base", { pizzaDough: 1 }),
  // Rolling and cutting one croissant dough gives 3 preforms.
  p(
    "doughTable",
    "rawCroissant",
    "Croissant dough (roll and cut)",
    { croissantDough: 1 },
    3
  ),
  p("pastaMachine", "spaghetti", "Spaghetti", { pastaDough: 1 }),
  p("pastaMachine", "trofie", "Trofie", { pastaDough: 1 }),
  // Lasagna sheet yield is unverified (docs/TODO.md).
  p("pastaMachine", "lasagnaSheets", "Lasagna sheets", { pastaDough: 1 }),
  // One grind fills the machine for 6 shots.
  p("grinder", "groundCoffee", "Coffee beans", { coffeeBeans: 1 }, 6),

  // Cook
  p("toast", "toastedBread", "Bruschetta bread", { breadSlice: 1 }),
  p("pan", "mushroomTopping", "Mushrooms and garlic", {
    slicedMushroom: 2,
    slicedGarlic: 1,
  }),
  p("pan", "friedGuanciale", "Guanciale", { slicedGuanciale: 1 }),
  p("pan", "amatricianaSauce", "Amatriciana sauce", {
    slicedGuanciale: 1,
    tomatoSauce: 1,
  }),
  p("pan", "shrimpSauce", "Shrimp cream sauce", {
    slicedGarlic: 1,
    shrimp: 1,
    cream: 1,
    gratedParmesan: 1,
  }),
  p("pan", "ragu", "Ragù", { mincedMeat: 1, slicedGarlic: 1, tomatoSauce: 1 }),
  p("pan", "bechamel", "Béchamel", { milk: 1, flour: 1 }),
  p("pan", "friedSeafood", "Seafood (insalata di mare)", {
    shrimp: 3,
    cleanMussels: 3,
    cleanClams: 3,
  }),
  // One pot holds one portion of pasta, which serves 2 dishes.
  p("pot", "cookedSpaghetti", "Spaghetti", { spaghetti: 1 }, 2),
  p("pot", "cookedTrofie", "Trofie", { trofie: 1 }, 2),
  p("oven", "bakedLasagna", "Lasagna", {
    lasagnaSheets: 1,
    ragu: 1,
    bechamel: 1,
    gratedParmesan: 1,
    oliveOil: 1,
  }),
  // An oven holds 3 croissants at a time.
  p("oven", "croissant", "Croissants (3 per oven)", { rawCroissant: 1 }),
  p("oven", "bakedSeaBass", "Sea bass", {
    cleanSeaBass: 1,
    cutLemon: 1,
    thyme: 1,
    oliveOil: 1,
  }),
  // The garlic goes in whole, uncut.
  p("oven", "bakedDorada", "Dorada", {
    cleanSeaBream: 1,
    slicedTomato: 2,
    garlic: 1,
    oliveOil: 1,
  }),
  p("pizzaOven", "pizzaMargherita", "Margherita", {
    pizzaBase: 1,
    tomatoSauce: 1,
    slicedMozzarella: 1,
    basil: 1,
    oliveOil: 1,
  }),
  p("pizzaOven", "pizzaSalami", "Spicy salami", {
    pizzaBase: 1,
    tomatoSauce: 1,
    slicedMozzarella: 1,
    slicedSalami: 1,
    basil: 1,
    oliveOil: 1,
  }),
  p("pizzaOven", "pizzaQuattroFormaggi", "Quattro formaggi", {
    pizzaBase: 1,
    slicedMozzarella: 1,
    slicedGorgonzola: 1,
    gratedParmesan: 1,
    gratedPecorino: 1,
    oliveOil: 1,
  }),
  p("pizzaOven", "pizzaProsciuttoFunghi", "Prosciutto e funghi", {
    pizzaBase: 1,
    tomatoSauce: 1,
    slicedMozzarella: 1,
    slicedHam: 1,
    slicedMushroom: 1,
    oliveOil: 1,
  }),
  p("pizzaOven", "pizzaCapricciosa", "Capricciosa", {
    pizzaBase: 1,
    tomatoSauce: 1,
    slicedMozzarella: 1,
    slicedHam: 1,
    slicedMushroom: 1,
    slicedArtichoke: 1,
    blackOlives: 1,
    oliveOil: 1,
  }),
  p("coffee", "espressoShot", "Espresso", { groundCoffee: 1 }),
  p("coffee", "cappuccino", "Cappuccino", { groundCoffee: 1, milk: 1 }),
  p("coffee", "macchiato", "Caffè macchiato", { groundCoffee: 1, milk: 1 }),
  p("coffee", "marocchino", "Marocchino", {
    groundCoffee: 1,
    milk: 1,
    cacao: 1,
  }),
]
