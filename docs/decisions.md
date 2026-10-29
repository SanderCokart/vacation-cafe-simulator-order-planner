# Product decisions

Settled with the user during design grilling. Newest round last.

## UI direction
- Base: Design C, the station focus mode. One large current task, grouped by station, across the Prep, Cook and Plate phases.
- Phase icons (Lucide): Prep = `Slice`, Cook = `Flame`, Plate = `UtensilsCrossed`.
- Order entry is Spotlight/Raycast-style search. Enter adds the highlighted recipe, pressing Enter again adds another, and Backspace clears the whole field. No grids of +/- steppers.

## Round 1
1. **Platform.** Desktop first (second monitor or alt-tab). A tablet is nice to have. Phones aren't a goal.
2. **Orders.** Orders are auto-numbered, and you can optionally replace the number with a table number.
3. **Combined work.** Prep and cook work is added up across all orders. Plating stays per order.
4. **Removing dishes.** Only explicit removal: a delete button, or the dish being completed. Backspace on an empty field doesn't remove anything.
5. **Equipment.** The app doesn't track equipment levels or station multipliers. The player picks their own most efficient route.
6. **Phases.** You can jump freely between Prep, Cook and Plate. Unlocking cook segments as prep finishes is planned for later (see TODO.md).
7. **Timers.** None. Instead, show how many of each appliance are needed in parallel, for example "4× oven: 4 ovens × 1 round · 2 × 2 · 1 × 4".
8. **Prep icon.** `Slice`.
9. **Saving.** Progress is saved to the browser's localStorage, and a "New round" action resets it.
10. **Recipe library.** A read-only list of recipes. Editing comes later.

## Round 2
1. **Search placement.** The search field is always visible at the top center, and `Ctrl+K` or `/` puts the cursor in it.
2. **Order navigation.** `Shift+Enter` closes the current order and starts the next. There must also be a way to go back to a previous order.
3. **Table numbers.** You edit the "Order N" label inline to set a table number.
4. **Adding orders mid-round.** Progress is tracked as done quantities, so a new order only adds the difference (for example, "Cut 2 more tomatoes"). Keep this only if it doesn't add much complexity.
5. **Delivered orders.** When all plating for an order is checked off, it moves to a "Delivered" section. Delivered orders can be deleted, with a confirmation dialog.
6. **Task cards.** One card per station, listing everything for that station (for example, "Grater: 3 parmesan, 1 pecorino").
7. **Batch yields.** Only fixed yields are modelled. For example, 1 ground coffee gives 6 shots, so the app predicts how many to grind.
8. **Baked dishes (pizza, lasagna).**
   - Prep: cutting, grating, dough.
   - Cook: assemble and put in the oven.
   - Plate: take it out of the oven and serve.
9. **Ovens.** "Oven" means the stove oven, not the pizza oven. It holds 1 item, except croissants (3 per oven at max level).
10. **Recipe facts.**
    - 1 ciabatta is cut into 4 pieces, and each bruschetta uses 2, so 1 ciabatta makes 2 bruschettas.
    - The Lasagna is baked.
    - The Quattro Formaggi has no tomato sauce.
    - The Margherita's mozzarella is cut.

## Round 3
1. **Shortcuts.** `Ctrl+K` and `/` put the cursor in the top-center search field. Its dropdown shows the matching recipes and the order being built. There's no second overlay.
2. **Order navigation.** `Alt+↑` and `Alt+↓` move to the previous and next order. Order chips under the search field let you jump with the mouse.
3. **Completing a card.** A station card is completed in one go with a single "Done" button. There are no checkboxes per line (multi-cut handles a whole stack at once).
4. **Ingredient pickup first.** At the start, the player collects every raw ingredient needed (for example, 20 gorgonzola), so nothing is over-used.
5. **Spares.** Spares come only from fixed batch yields (coffee 6 shots, ciabatta 2 bruschettas, pasta pot 2 portions). They're shown, and they count toward the next calculation. Delivered orders leave no spares.
6. **Yields stay editable.** The lasagna sheet yield isn't verified, so yields must be easy to change in the data.
7. **Capacities (max level).**
   - Pizza oven: 3 pizzas.
   - Stove oven: 1 item (3 croissants).
   - Pot: 1 portion of pasta, which gives 2 servings.
   - Pan: 1 dish's worth.
8. **Station order.** A fixed default for now. Reordering goes on the TODO list.
9. **Drinks.** Wine and Prosecco appear only as Plate (pour) tasks.
10. **Tests.** Vitest unit tests cover the calculation logic. The UI isn't tested.

## Round 4
1. **Gather phase.** The phases are Gather → Prep → Cook → Plate. Gather uses the `ShoppingBasket` icon and is one card listing every raw ingredient for the round, finished with a single "Collected" button.
2. **Gathering after new orders.** Gather reopens with only the difference ("Collect 4 more gorgonzola"), using the same done-quantity tracking as Prep.
3. **Spares and new rounds.** "New round" keeps spares. A separate "Clear spares" button removes them.
4. **Deleting an active order.** Its already-done work just disappears from the counts. No spares are tracked.
5. **No appliance counts.** The capacity and parallel-appliance hint is dropped completely. Tasks just say "Bake 6 sea bass", and the player works out how many ovens to use. Capacity numbers aren't needed in the data.
6. **Layout.**
   - Header: the app name on the left, the search field top center, and a "Recipes" button on the right. Recipes opens a side sheet.
   - Main area: the station focus view with the phase tabs.
   - Side rail: the order list, with active orders first and a collapsed "Delivered" section below.
7. **Theme.** Follows the system light/dark setting, with no manual toggle. Use `@wrksz/themes` (`ClientThemeProvider` from `@wrksz/themes/client`, `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`), the same setup as sandercokart.com.

## After version 1
- **Seafood cleaning batches.** Mussels and clams can only be cleaned in batches of 6 (6, 12 or 18). The planner rounds up to whole batches of 6, gathers 6 per batch, and keeps the leftovers as spares.
- **Olive oil.** It's unlimited and always on hand, so it's added at plating but never shown on the gather list. Items like this are marked `staple: true` in `src/data/items.ts`.
- **Backspace.** This replaces round 1, decision 4. Backspace only clears the field. `Ctrl+Backspace` takes one off the last added dish in the current order (plain Backspace removed dishes by accident).

## Inventory limit (built in v2)
Facts so far:
- **Slots.** The inventory has 10 slots. It's fixed and can't be upgraded (it's bound to the number keys). A web search found no upgrade.
- **Stacks.** Most ingredients stack up to 10 per slot. Plates stack to 20.
- **Multi-use containers.** Milk (6 uses) and cacao take 1 slot each and don't stack. A cacao container has 4 charges (confirmed).
- **Prepped items take slots.** Cutting a tomato gives a cut tomato back into the inventory.
- **Counters.** Items can be put down on counters, but each one has to be dropped separately (10 mozzarellas = 10 drops), so counter use should be kept to a minimum.
- **Plates.** Plating needs a plate in the inventory, which takes a slot.
- **Preferred approach (from you).** Work in gather batches: gather a set, prep it, set it aside, then gather the next set.
- **Waves (decided).** The round is split into waves. Each wave's whole chain (gather → prep → cook → plate) fits in 10 slots, so items rarely need to be dropped. Within a wave, work is combined across dishes and can use several stations (for example, cutting and mixing in the same wave).
- **Prepped items stack to 10.** The upgraded cutter cuts a whole stack 1-to-1, in the same slot. The basic cutting table splits it into 2 stacks (still-uncut items plus cut items), so plan conservatively for the cutting table.
- **Single-use items.** Flour, sugar, tomato sauce, pesto sauce, cream, gelatin, mascarpone, black olives and coffee beans are single use. Coffee beans give 6 uses once ground. Milk (6) and cacao (4 charges) are the only multi-use containers.
- **Container leftovers.** Leftover uses in a container (for example, 4 milk uses) are kept as spares.
- **Finished dishes.** A plated dish stays in the inventory, 1 per slot, until it's served. So 10 dishes is the most you can carry, and fewer if you're also carrying plates.
- **Gather trips.** Gather becomes trip cards ("Trip 1 of 3"), each at most 10 slots, each with its own "Collected" button.
- **Cutting-table slot.** Every wave keeps 1 slot free for the basic cutting table's split stack.
- **Waves aim for efficiency, not order.** Who ordered first doesn't matter. Waves group dishes for the most efficient route to serve everyone, even if that takes several waves.
- **Stations that hold output.** The oven, the pizza oven and the (upgraded) mixer keep their output until it's picked up. The mixer gives one item per click.
- **Plates and glasses.**
  - Plates come from a cupboard, 20 per slot. Once plating starts, 1 slot is reserved for plates.
  - Desserts need a plate. Drinks need a glass, not a plate.
- **Spares between waves.** They're dropped on a counter, not left in the pot.
- **Waves in progress.** Once a wave has started, it never changes.
- **Navigating waves.** A "Wave 1 of N" stepper sits above the phase tabs, and the focus view shows only the current wave.
- **Mixer and oven output stacks.** Up to 10 per slot, even though each item is picked up with its own click.
- **Glasses and drinks.** Empty glasses stack to 10 per slot. A filled drink takes 1 slot, the same as a finished dish.
- **What "efficient" means.** Fewest waves first, then fewest leftovers. Dishes that share a batch stay in the same wave (2 per pasta pot, 2 per ciabatta, 6 per coffee grind, seafood in 6s).
- **Wave splitting.** A fast rule of thumb, not an exhaustive search. It updates instantly as you type.
- **Plating cards.** A wave's Plate card groups dishes by order. An order counts as delivered once all its dishes are served, even across waves.
- **Waves are self-contained.** No storage carries over between waves; only true leftovers do, dropped on a counter.
- **Coffee cups.** Coffee needs a cup from the cupboard. Empty cups are assumed to stack 10 per slot, like glasses. A filled cup takes 1 slot and doesn't stack.

## Table priority mode (built in v3)
- **Two modes.** A toggle next to the wave stepper, remembered between sessions. **Table priority** is the default; **Efficient** packs for the fewest trips. Switching only reshuffles waves that haven't started.
- **Table order.** In table priority, tables are finished in order-number order.
- **Spare room.** Leftover room in a wave is filled with the next table's dishes, so the inventory is used as fully as possible. Those dishes are put aside on the counter until their table is complete.
- **Partial serving.** Customers accept part of their order (only drinks, or only food), and drinks are normally served before food.
- **Drinks overview.** You'd like to see the drinks every table needs next to the current table's drinks, so all drinks can be made in one go.
- **Pickup room.** When a table is completed, its dishes from the counter plus this wave's finished items must fit in 10 slots. A table bigger than your hands is served in two trips, and the plate card says so.
- **Serve whole tables in both modes.** Efficient only changes how dishes are packed into waves.
- **Plate card.** One card with three sections, grouped by table: plate, put aside on the counter, then pick up and serve. One Done button.
- **Drinks first.** The first wave(s) make drinks for every table at once, and each table gets its drinks right away. Serve-together applies to each table's food.
- **Drinks strip.** A compact strip above the wave shows the drinks still needed across all tables and for the current table. Once they're all served, it shrinks to "All drinks served ✓".
- **What counts as a drink.** Coffee and Wine categories only. Panna cotta comes in a glass but is a dessert, so it goes with food.
- **No courses.** Desserts go out with the food.
- **Drinks first in both modes.** Efficient mode also starts with the drinks wave(s).
- **Drinks ordered later.** They get their own small drinks wave, placed right after the waves already started and ahead of the remaining food waves.
