import type { Amounts } from "@/data/items"

export type Category =
  | "Bruschetta"
  | "Pizza"
  | "Pasta"
  | "Seafood"
  | "Cold"
  | "Dessert"
  | "Coffee"
  | "Wine"

export const CATEGORIES: Category[] = [
  "Bruschetta",
  "Pizza",
  "Pasta",
  "Seafood",
  "Cold",
  "Dessert",
  "Coffee",
  "Wine",
]

export interface Recipe {
  id: string
  name: string
  category: Category
  /** What the plating step consumes for one dish. */
  plate: Amounts
  /** The plating instruction shown on the order card. */
  serve: string
  aliases?: string[]
}

// Source data and open questions: docs/recipes.md and docs/TODO.md.
export const RECIPES: Recipe[] = [
  {
    id: "tomatoBruschetta",
    name: "Tomato Bruschetta",
    category: "Bruschetta",
    plate: { toastedBread: 1, slicedTomato: 2, basil: 2, oliveOil: 1 },
    serve: "Bread, tomato, basil, then olive oil",
  },
  {
    id: "bruschettaFunghi",
    name: "Bruschetta ai Funghi",
    category: "Bruschetta",
    plate: { toastedBread: 1, mushroomTopping: 1, parsley: 2, oliveOil: 1 },
    serve: "Pile the mushrooms on the warm bread, add parsley and olive oil",
    aliases: ["mushroom"],
  },
  {
    id: "pestoBruschetta",
    name: "Pesto Bruschetta",
    category: "Bruschetta",
    plate: {
      toastedBread: 1,
      slicedTomato: 2,
      slicedMozzarella: 1,
      pestoSauce: 1,
      basil: 2,
      oliveOil: 1,
    },
    serve: "Bread, pesto, tomato, mozzarella, basil, olive oil",
  },
  {
    id: "margherita",
    name: "Pizza Margherita",
    category: "Pizza",
    plate: { pizzaMargherita: 1 },
    serve: "Take out of the pizza oven and serve",
  },
  {
    id: "spicySalamiPizza",
    name: "Spicy Salami Pizza",
    category: "Pizza",
    plate: { pizzaSalami: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["pepperoni"],
  },
  {
    id: "quattroFormaggi",
    name: "Pizza Quattro Formaggi",
    category: "Pizza",
    plate: { pizzaQuattroFormaggi: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["four cheese"],
  },
  {
    id: "prosciuttoFunghi",
    name: "Pizza Prosciutto e Funghi",
    category: "Pizza",
    plate: { pizzaProsciuttoFunghi: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["ham", "mushroom"],
  },
  {
    id: "capricciosa",
    name: "Pizza Capricciosa",
    category: "Pizza",
    plate: { pizzaCapricciosa: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["artichoke"],
  },
  {
    id: "carbonara",
    name: "Pasta Carbonara",
    category: "Pasta",
    plate: {
      cookedSpaghetti: 1,
      friedGuanciale: 1,
      gratedPecorino: 1,
      eggs: 1,
    },
    serve: "Toss spaghetti with guanciale, egg and pecorino",
  },
  {
    id: "amatriciana",
    name: "Pasta all'Amatriciana",
    category: "Pasta",
    plate: { cookedSpaghetti: 1, amatricianaSauce: 1, gratedPecorino: 1 },
    serve: "Toss spaghetti with the sauce, pecorino on top",
  },
  {
    id: "creamyShrimpPasta",
    name: "Creamy Shrimp Pasta",
    category: "Pasta",
    plate: { cookedSpaghetti: 1, shrimpSauce: 1, gratedParmesan: 1 },
    serve: "Combine pasta and sauce, parmesan on top",
  },
  {
    id: "lasagna",
    name: "Lasagna Bolognese",
    category: "Pasta",
    plate: { bakedLasagna: 1 },
    serve: "Take out of the oven and serve",
  },
  {
    id: "trofiePesto",
    name: "Trofie with Pesto",
    category: "Pasta",
    plate: { cookedTrofie: 1, pestoSauce: 1, gratedParmesan: 1 },
    serve: "Toss trofie with pesto, parmesan on top",
  },
  {
    id: "oysters",
    name: "Oysters with Lemon",
    category: "Seafood",
    plate: { shuckedOyster: 1, cutLemon: 1 },
    serve: "Oyster on the plate with a lemon wedge",
  },
  {
    id: "seaBass",
    name: "Sea Bass with Lemon and Thyme",
    category: "Seafood",
    plate: { bakedSeaBass: 1 },
    serve: "Take out of the oven, serve on a fish plate",
  },
  {
    id: "insalataDiMare",
    name: "Insalata di Mare",
    category: "Seafood",
    plate: {
      friedSeafood: 1,
      arugula: 3,
      cutLemon: 1,
      parsley: 1,
      oliveOil: 1,
    },
    serve: "Arugula bed, seafood on top, lemon, parsley and olive oil",
    aliases: ["seafood salad"],
  },
  {
    id: "caprese",
    name: "Caprese Salad",
    category: "Cold",
    plate: { slicedMozzarella: 1, slicedTomato: 1, basil: 1, oliveOil: 1 },
    serve: "Layer mozzarella and tomato, basil, then olive oil",
  },
  {
    id: "cheesePlatter",
    name: "Cheese Platter",
    category: "Cold",
    plate: { slicedParmesan: 1, slicedGorgonzola: 1, slicedPecorino: 1 },
    serve: "Arrange the cheeses",
  },
  {
    id: "antipastoMisto",
    name: "Antipasto Misto",
    category: "Cold",
    plate: {
      slicedHam: 1,
      slicedSalami: 1,
      slicedArtichoke: 1,
      slicedGorgonzola: 1,
      slicedPecorino: 1,
      slicedParmesan: 1,
      blackOlives: 1,
    },
    serve: "Arrange meats, cheeses, artichoke and olives",
  },
  {
    id: "chocolatePannaCotta",
    name: "Chocolate Panna Cotta",
    category: "Dessert",
    plate: { chocolatePannaCotta: 1, cacao: 1 },
    serve: "Cacao on top",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "Dessert",
    plate: { mascarponeCream: 1, espressoShot: 1, ladyfingers: 1, cacao: 1 },
    serve: "Ladyfingers dipped in coffee, mascarpone cream, cacao on top",
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "Coffee",
    plate: { espressoShot: 1 },
    serve: "Serve the cup",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "Coffee",
    plate: { cappuccino: 1 },
    serve: "Serve the cup",
  },
  {
    id: "macchiato",
    name: "Caffè Macchiato",
    category: "Coffee",
    plate: { macchiato: 1 },
    serve: "Serve the cup",
  },
  {
    id: "marocchino",
    name: "Marocchino",
    category: "Coffee",
    plate: { marocchino: 1, cacao: 1 },
    serve: "Cacao on top, serve the cup",
  },
  ...(
    [
      ["vermentino", "Vermentino"],
      ["pinotGrigio", "Pinot Grigio"],
      ["barbera", "Barbera"],
      ["chianti", "Chianti"],
      ["houseWine", "House Wine"],
      ["prosecco", "Prosecco"],
    ] as const
  ).map(([id, name]): Recipe => ({
    id,
    name,
    category: "Wine",
    plate: {},
    serve: "Pour a glass at the counter",
    aliases: ["wine"],
  })),
]

export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe])
) as Record<string, Recipe>
