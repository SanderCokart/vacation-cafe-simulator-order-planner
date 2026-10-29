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
- Click an order's name to give it a table number.
- Prep and cook work is combined across all orders, one card per station.
- Adding orders mid-round reopens only the difference.
- Leftovers from batch yields (a ciabatta makes 2 bruschettas, 1 coffee grind makes 6 shots, 1 pot of pasta serves 2) are kept as spares when you start a new round.
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
