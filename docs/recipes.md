# Recipe source data

This file is the source of truth for `src/data/recipes.ts`. Recipe names match the in-game menu. Quantities are per single dish.
`?` marks an assumption that still needs confirming. Missing recipes are listed in [TODO.md](TODO.md).

Shared sub-recipes:
- **Ciabatta:** 1 ciabatta is sliced into 4 pieces; a bruschetta uses 2 pieces, so 1 ciabatta makes 2 bruschettas.
- **Pizza dough:** fresh yeast + flour, mixed at the mixer, then rolled into a pizza base on the pasta machine.
- **Pasta dough:** 2 eggs + 1 flour at the mixer. The pasta machine turns 1 pasta dough into fresh pasta, fresh trofie or sfoglie per lasagne. Boiled, fresh pasta is "boiled pasta".
- **Boiling pasta:** 1 pot = 1 portion of pasta = 2 servings. Lasagna sheet yield is unverified; keep it editable.
- **Ground coffee:** coffee beans in the grinder. One grind gives 6 shots from the machine.
- **Seafood cleaning:** mussels and clams are cleaned in batches of 6 only (6, 12 or 18 at a time, never 3). Leftovers become spares.
- **Espresso shot:** ground coffee, portafilter, machine.
- **Olive oil:** unlimited and always on hand; never gathered.

## Bruschetta
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Bruschetta with Tomatoes | slice ciabatta ×½; slice tomato ×2 | toast bread (stove) | basil ×2, olive oil |
| Bruschetta ai Funghi | slice ciabatta ×½; slice mushroom ×2; slice garlic ×1 | toast bread; fry mushrooms + garlic + oil (pan) | parsley ×2, olive oil |
| Bruschetta ai Gamberi | slice ciabatta ×½; cut lemon ×1 | toast shrimp ×2 (stove) | arugula ×2, olive oil |
| Bruschetta al Pesto | slice ciabatta ×½; slice tomato ×2; slice mozzarella ×1 | toast bread | pesto sauce ×1, basil ×2, olive oil |

## Pizza (prep → cook: assemble + put in the pizza oven → plate: take out and serve)
| Recipe | Prep | Cook: assemble, then pizza oven |
|---|---|---|
| Margherita Pizza | pizza dough; slice mozzarella | tomato sauce, mozzarella, basil, olive oil |
| Salami Piccante | as Margherita + slice spicy salami | as Margherita + salami |
| Quattro Formaggi Pizza | pizza dough; slice mozzarella ×1, gorgonzola ×1; grate parmesan ×1, pecorino ×1 | cheeses, olive oil (no tomato sauce) |
| Prosciutto e Funghi Pizza | pizza dough; slice mozzarella ×1, ham ×1, mushroom ×1 | tomato sauce, olive oil |
| Capricciosa Pizza | pizza dough; slice mozzarella ×1, ham ×1, mushroom ×1, artichoke ×1 | tomato sauce, black olives (kind assumed), olive oil |

## Pasta
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Pasta Carbonara | fresh pasta (pasta dough); grate pecorino; slice guanciale | boil the pasta; fry guanciale | combine cheese + egg, plate |
| Pasta all'Amatriciana | fresh pasta (pasta dough); slice guanciale; grate pecorino ×1 | fry guanciale, simmer with tomato sauce (pan); boil the pasta | combine, pecorino on top |
| Creamy Shrimp Pasta | fresh pasta (pasta dough); slice garlic ×1; grate parmesan ×2 | fry garlic + shrimp + cream + 1 grated parmesan (pan); boil the pasta | combine, 1 grated parmesan on top |
| Lasagna alla Bolognese | sfoglie per lasagne (pasta dough); grate parmesan ×1 | ragù: minced meat + garlic + tomato sauce (pan); béchamel: full 6/6 milk + flour (pan); assemble with parmesan + olive oil; oven | take out of oven, serve |
| Trofie al Pesto | pasta dough → pasta machine (fresh trofie); grate parmesan ×1 | boil trofie (1 boil = 2 servings) | pesto sauce, parmesan |

## Seafood
| Recipe | Prep | Cook | Plate |
|---|---|---|---|
| Oysters with Lemon | oyster table: 3 oysters per serving (1×, 2× or 3× at a time); cut lemon ×1 for wedges | none | plate |
| Sea Bass with Lemon and Thyme | descale sea bass (fish station); cut lemon | assemble with thyme + olive oil, bake (oven) | take out, fish plate |
| Dorada with Tomatoes and Garlic | descale sea bream (fish station, assumed); slice tomato ×2 | assemble with a whole uncut garlic + olive oil, bake (oven) | take out, fish plate |
| Insalata di Mare | clean mussels ×3, clams ×3 (seafood station); lemon wedges ×1 | fry shrimp ×3 + mussels ×3 + clams ×3 (pan) | arugula ×3 bed, parsley ×1, olive oil, lemon |

## Cold
| Recipe | Prep | Plate |
|---|---|---|
| Beef Carpaccio | cut beef ×1; grate parmesan ×1; cut lemon ×1 | arugula ×1, olive oil, assemble |
| Insalata di Rucola | grate parmesan ×1; slice tomato ×2; cut lemon ×1 | arugula ×3, assemble, olive oil on top |
| Caprese Salad | slice mozzarella, slice tomato | layer, basil, olive oil |
| Cheese Platter | cut parmesan, gorgonzola, pecorino (grated? unconfirmed) | assemble |
| Antipasto Misto | slice ham, spicy salami, artichoke, gorgonzola, pecorino, parmesan | black olives, assemble |

## Desserts
| Recipe | Prep | Plate |
|---|---|---|
| Panna Cotta | mixer: cream + sugar + gelatin + empty glass (from the cupboard) → panna cotta preform | serve the glass (topping unknown) |
| Chocolate Panna Cotta | mixer: cream + sugar + gelatin + empty glass + 1 cacao charge → chocolate preform | another cacao charge on top |
| Croissant | mixer: flour + full milk bottle (6/6) + eggs + fresh yeast → 1 croissant dough; dough table: roll and cut → 3 croissant preforms; oven: bake (3 per oven) | plate; fillings go in after plating |
| Croissant with Jam | croissant | fill with berry sauce |
| Croissant with Cream | croissant; mixer: mascarpone + sugar + egg → mascarpone cream (same as tiramisu) | fill with the mascarpone cream |
| Croissant with Chocolate | croissant; mixer: egg + sugar + cacao + mascarpone → chocolate filling | fill with the chocolate filling |
| Tiramisu | mix eggs + sugar + mascarpone into mascarpone cream; 1 espresso shot | ladyfingers (savoiardi), coffee, cream, cacao on top |

## Drinks
| Recipe | Prep | Cook | Serve |
|---|---|---|---|
| Espresso | ground coffee (1 grind = 6) | machine | cup |
| Cappuccino | ground coffee | machine + milk | cup |
| Caffè Macchiato | ground coffee | machine + milk foam | cup |
| Caffè Marocchino | ground coffee; cacao in cup | machine + milk | cacao on top |
| Wine (Vermentino, Pinot Grigio, Barbera, Chianti, house) | none | none | pour |
| Prosecco | none | none | pour |
