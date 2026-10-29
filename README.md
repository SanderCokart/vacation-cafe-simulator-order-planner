# Café prep planner

An order planner for Vacation Cafe Simulator. Type in orders and it turns them into one combined to-do list in four phases: **Gather → Prep → Cook → Plate**.

## Running it

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm test` (Vitest), `pnpm build`, `pnpm lint`.

## Using it

| Key | What it does |
|---|---|
| `/` or `Ctrl K` | Focus the search field |
| `Enter` | Add the highlighted dish (press again to add another) |
| `Shift Enter` | Start the next order |
| `Alt ↑` / `Alt ↓` | Switch between orders |
| `Backspace` | Clear the search field |
| `Ctrl Backspace` | Remove one of the last added dish |
| `Esc` | Close the search |

- **Waves.** The game only has 10 inventory slots, so the planner splits the round into waves that each fit in your hands:
  - Ingredients stack to 10. Milk and cacao take 1 slot per container.
  - Every filled cup or finished dish takes its own slot, plus 1 slot each for the plates and glasses.
  - 1 slot is kept free for the basic cutting table.
  - Dishes that share a batch (pasta pots, ciabatta, coffee grinds, seafood) stay together, and leftovers carry over to the next wave.
  - Once a wave has started, it never changes.
- **Table priority (default) or Efficient.** Use the toggle next to the wave stepper:
  - **Drinks first.** The first waves make drinks for every table. A strip above the wave shows the drinks still needed per table. In table priority, a table's drinks wait on the counter until all of them are ready; in Efficient they're served straight away.
  - **Table priority** finishes tables in order and fills any spare room with the next table's dishes. **Efficient** packs food for the fewest waves.
  - **Whole tables at once.** In both modes, food for a table that isn't complete goes aside on the counter. The wave that completes the table tells you to pick it back up and serve the table together.
- **Log.** The Log button in the header shows every step: orders, waves started (with their dishes and slot use), cards done and reopened, served waves, mode changes and rounds. Each has a timestamp and round number. Export it as JSON to look for optimizations.
- **Coffee in pairs.** The coffee machine brews 2 cups at once, so drinks waves keep an even number of coffees where they can. The coffee card says how many rounds of 2 to brew.
- Click an order's name to give it a table number.
- Prep and cook work is combined across all orders, one card per station.
- Adding orders mid-round reopens only the difference.
- **Spares on the counter.** In the Spares panel, the + button adds any item with quick search. Containers ask for the charges left (Cacao 1/4, Milk 2/6, Ground coffee 5/6, Chianti 3/5), and everything else asks for a count. Each spare is its own entry, which you can edit or remove, because every container takes its own slot when you carry it.
  - The planner uses the emptiest containers first. Partial charges combine, so 1/6 + 5/6 milk makes a full 6/6. The pickup card lists exactly which spares to grab before anything new.
  - Wine and Prosecco come in 5-glass bottles from the wine rack.
  - Leftovers from batch yields and opened containers (a ciabatta makes 2 bruschettas, 1 coffee grind fills a 6-shot can, 1 pot of pasta serves 2) become spare entries when you start a new round.
- Progress is saved in the browser's localStorage.

## Where things live

- `src/data/`: recipe data. `items.ts` lists ingredients, `processes.ts` lists station actions and their yields, `recipes.ts` lists dishes and what plating uses.
- `src/lib/planner.ts`: the calculation for one set of dishes.
- `src/lib/slots.ts` and `src/lib/waves.ts`: inventory slot counting and splitting into waves.
- Tests sit next to each file in `src/lib/`.
- `docs/`: [design decisions](docs/decisions.md), [recipe source data](docs/recipes.md), [TODO](docs/TODO.md).

## Adding a recipe

1. Add any new ingredients to `src/data/items.ts`.
2. Add a process to `src/data/processes.ts` for every prep or cook step that produces something new.
3. Add the dish to `src/data/recipes.ts`. Its `plate` lists the items plating consumes.

The planner works out the rest. Run `pnpm test` afterwards.
