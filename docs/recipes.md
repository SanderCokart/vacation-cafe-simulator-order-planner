# Recipe source data

This file is the source of truth for `src/data/recipes.ts` (not written yet). Quantities are per single dish.
`?` marks an assumption that still needs confirming. Missing recipes are listed in [TODO.md](TODO.md).

Shared sub-recipes:
- **Ciabatta:** 1 ciabatta is sliced into 4 pieces; a bruschetta uses 2 pieces, so 1 ciabatta makes 2 bruschettas.
- **Pizza dough:** fresh yeast + flour, mixed at the mixer, then rolled out.
- **Fresh pasta:** eggs + flour, mixed, then put through the pasta machine (spaghetti, sheets, trofie).
- **Boiling pasta:** 1 pot = 1 portion of pasta = 2 servings. Lasagna sheet yield is unverified; keep it editable.
- **Ground coffee:** coffee beans in the grinder. One grind gives 6 shots from the machine.
- **Seafood cleaning:** mussels and clams are cleaned in batches of 6 only (6, 12 or 18 at a time, never 3). Leftovers become spares.
- **Espresso shot:** ground coffee, portafilter, machine.
- **Olive oil:** unlimited and always on hand; never gathered.

## Bruschetta
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Tomato Bruschetta | slice ciabatta ×½; slice tomato ×2 | toast bread (stove) | basil ×2, olive oil |
| Bruschetta ai Funghi | slice ciabatta ×½; slice mushroom ×2; slice garlic ×1 | toast bread; fry mushrooms + garlic + oil (pan) | parsley ×2, olive oil |
| Pesto Bruschetta | slice ciabatta ×½; slice tomato ×2; slice mozzarella ×1 | toast bread | pesto sauce ×1, basil ×2, olive oil |

## Pizza (prep → cook: assemble + put in the pizza oven → plate: take out and serve)
| Recipe | Prep | Cook: assemble, then pizza oven |
|---|---|---|
| Margherita | pizza dough; slice mozzarella | tomato sauce, mozzarella, basil, olive oil |
| Spicy Salami | as Margherita + slice spicy salami | as Margherita + salami |
| Quattro Formaggi | pizza dough; slice mozzarella ×1, gorgonzola ×1; grate parmesan ×1, pecorino ×1 | cheeses, olive oil (no tomato sauce) |
| Prosciutto e Funghi | pizza dough; slice mozzarella ×1, ham ×1, mushroom ×1 | tomato sauce, olive oil |
| Capricciosa | pizza dough; slice mozzarella ×1, ham ×1, mushroom ×1, artichoke ×1 | tomato sauce, black olives (kind assumed), olive oil |

## Pasta
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Carbonara | spaghetti (eggs + flour); grate pecorino; slice guanciale | boil spaghetti; fry guanciale | combine cheese + egg, plate |
| Amatriciana | spaghetti (eggs + flour); slice guanciale; grate pecorino ×1 | fry guanciale, simmer with tomato sauce (pan); boil spaghetti | combine, pecorino on top |
| Creamy Shrimp Pasta | spaghetti (eggs ×1 + flour ×1); slice garlic ×1; grate parmesan ×2 | fry garlic + shrimp + cream + 1 grated parmesan (pan); boil spaghetti | combine, 1 grated parmesan on top |
| Lasagna Bolognese | sheets (eggs + flour); grate parmesan ×1 | ragù: minced meat + garlic + tomato sauce (pan); béchamel: milk + flour (pan); assemble with parmesan + olive oil; oven | take out of oven, serve |
| Trofie with Pesto | trofie (flour + eggs + milk); grate parmesan ×1 | boil trofie | pesto sauce, parmesan |

## Seafood
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Oysters with Lemon | shuck oyster (oyster table); lemon wedges | none | plate |
| Sea Bass with Lemon and Thyme | descale sea bass (fish station); slice lemon | bake (oven) | thyme, fish plate |
| Insalata di Mare | clean mussels ×3, clams ×3 (seafood station); lemon wedges ×1 | fry shrimp ×3 + mussels ×3 + clams ×3 (pan) | arugula ×3 bed, parsley ×1, olive oil, lemon |

## Cold
| Recipe | Prep | Plate |
|---|---|---|
| Caprese Salad | slice mozzarella, slice tomato | layer, basil, olive oil |
| Cheese Platter | cut parmesan, gorgonzola, pecorino (grated? unconfirmed) | assemble |
| Antipasto Misto | slice ham, spicy salami, artichoke, gorgonzola, pecorino, parmesan | black olives, assemble |

## Desserts
| Recipe | Prep | Plate |
|---|---|---|
| Chocolate Panna Cotta | mix cacao + gelatin + cream + sugar | cacao on top |
| Tiramisu | mix eggs + sugar + mascarpone into mascarpone cream; 1 espresso shot | ladyfingers (savoiardi), coffee, cream, cacao on top |

## Drinks
| Recipe | Prep | Cook | Serve |
|---|---|---|---|
| Espresso | ground coffee (1 grind = 6) | machine | cup |
| Cappuccino | ground coffee | machine + milk | cup |
| Caffè Macchiato | ground coffee | machine + milk foam | cup |
| Marocchino | ground coffee; cacao in cup | machine + milk | cacao on top |
| Wine (Vermentino, Pinot Grigio, Barbera, Chianti, house) | none | none | pour |
| Prosecco | none | none | pour |
