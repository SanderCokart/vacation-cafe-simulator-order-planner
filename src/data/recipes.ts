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
  /** False when the dish already sits in its own glass from an earlier step. */
  vessel?: false
}

// Source data and open questions: docs/recipes.md and docs/TODO.md.
export const RECIPES: Recipe[] = [
  {
    id: "tomatoBruschetta",
    name: "Bruschetta with Tomatoes",
    category: "Bruschetta",
    plate: { toastedBread: 1, slicedTomato: 2, basil: 2, oliveOil: 1 },
    serve: "Bread, tomato, basil, then olive oil",
    aliases: ["tomato bruschetta"],
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
    name: "Bruschetta al Pesto",
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
    aliases: ["pesto bruschetta"],
  },
  {
    id: "margherita",
    name: "Margherita Pizza",
    category: "Pizza",
    plate: { pizzaMargherita: 1 },
    serve: "Take out of the pizza oven and serve",
  },
  {
    id: "spicySalamiPizza",
    name: "Salami Piccante",
    category: "Pizza",
    plate: { pizzaSalami: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["spicy salami pizza", "pepperoni"],
  },
  {
    id: "quattroFormaggi",
    name: "Quattro Formaggi Pizza",
    category: "Pizza",
    plate: { pizzaQuattroFormaggi: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["four cheese"],
  },
  {
    id: "prosciuttoFunghi",
    name: "Prosciutto e Funghi Pizza",
    category: "Pizza",
    plate: { pizzaProsciuttoFunghi: 1 },
    serve: "Take out of the pizza oven and serve",
    aliases: ["ham", "mushroom"],
  },
  {
    id: "capricciosa",
    name: "Capricciosa Pizza",
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
    name: "Lasagna alla Bolognese",
    category: "Pasta",
    plate: { bakedLasagna: 1 },
    serve: "Take out of the oven and serve",
  },
  {
    id: "trofiePesto",
    name: "Trofie al Pesto",
    category: "Pasta",
    plate: { cookedTrofie: 1, pestoSauce: 1, gratedParmesan: 1 },
    serve: "Toss trofie with pesto, parmesan on top",
    aliases: ["trofie with pesto"],
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
    id: "dorada",
    name: "Dorada with Tomatoes and Garlic",
    category: "Seafood",
    plate: { bakedDorada: 1 },
    serve: "Take out of the oven, serve on a fish plate",
    aliases: ["sea bream"],
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
    id: "beefCarpaccio",
    name: "Beef Carpaccio",
    category: "Cold",
    plate: {
      slicedBeef: 1,
      gratedParmesan: 1,
      cutLemon: 1,
      arugula: 1,
      oliveOil: 1,
    },
    serve: "Beef, arugula, parmesan and lemon, then olive oil",
  },
  {
    id: "insalataDiRucola",
    name: "Insalata di Rucola",
    category: "Cold",
    plate: {
      arugula: 3,
      gratedParmesan: 1,
      slicedTomato: 2,
      cutLemon: 1,
      oliveOil: 1,
    },
    serve: "Arugula, tomato, parmesan and lemon, topped with olive oil",
    aliases: ["arugula salad"],
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
    id: "pannaCotta",
    name: "Panna Cotta",
    category: "Dessert",
    plate: { pannaCottaPreform: 1 },
    serve: "Serve the glass",
    vessel: false,
  },
  {
    id: "chocolatePannaCotta",
    name: "Chocolate Panna Cotta",
    category: "Dessert",
    plate: { chocolatePannaCottaPreform: 1, cacao: 1 },
    serve: "Another layer of cacao on top, serve the glass",
    vessel: false,
  },
  {
    id: "croissant",
    name: "Croissant",
    category: "Dessert",
    plate: { croissant: 1 },
    serve: "Take out of the oven and serve",
  },
  {
    id: "jamCroissant",
    name: "Croissant with Jam",
    category: "Dessert",
    plate: { croissant: 1, berrySauce: 1 },
    serve: "Fill with berry sauce",
    aliases: ["jam croissant", "berry"],
  },
  {
    id: "creamCroissant",
    name: "Croissant with Cream",
    category: "Dessert",
    // The same mascarpone cream as the tiramisu (confirmed).
    plate: { croissant: 1, mascarponeCream: 1 },
    serve: "Fill with mascarpone cream",
    aliases: ["cream croissant"],
  },
  {
    id: "chocolateCroissant",
    name: "Croissant with Chocolate",
    category: "Dessert",
    plate: { croissant: 1, chocolateFilling: 1 },
    serve: "Fill with chocolate filling",
    aliases: ["chocolate croissant"],
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
    name: "Caffè Marocchino",
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

/** What a dish is served in, picked up from the cupboard. */
export type Vessel = "plate" | "glass" | "cup"

export const vesselFor = (recipe: Recipe): Vessel | null =>
  recipe.vessel === false
    ? null
    : recipe.category === "Coffee"
      ? "cup"
      : recipe.category === "Wine"
        ? "glass"
        : "plate"

export const RECIPE_BY_ID = Object.fromEntries(
  RECIPES.map((recipe) => [recipe.id, recipe])
) as Record<string, Recipe>
