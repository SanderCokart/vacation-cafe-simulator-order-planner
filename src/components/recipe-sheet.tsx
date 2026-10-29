import { BookOpen, Plus } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

import { PHASE_ICONS } from "@/components/phase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ITEMS } from "@/data/items"
import { CATEGORIES, type Recipe } from "@/data/recipes"
import { STATIONS, type Phase } from "@/data/stations"
import { plan } from "@/lib/planner"
import { searchRecipes } from "@/lib/search"
import { usePlanner } from "@/store"

function Step({ phase, children }: { phase: Phase; children: ReactNode }) {
  const Icon = PHASE_ICONS[phase]
  return (
    <li className="flex gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </li>
  )
}

function RecipeEntry({ recipe }: { recipe: Recipe }) {
  const addDish = usePlanner((state) => state.addDish)
  const single = useMemo(
    () =>
      plan({ dishes: { [recipe.id]: 1 }, done: {}, collected: {}, spares: {} }),
    [recipe.id]
  )
  const byPhase = (phase: Phase) =>
    STATIONS.filter((station) => station.phase === phase).flatMap((station) => {
      const tasks = single.tasks.filter(
        (task) => task.process.station === station.id
      )
      if (!tasks.length) return []
      return [
        `${station.name}: ${tasks.map((task) => task.process.label).join(", ")}`,
      ]
    })

  return (
    <article className="rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{recipe.name}</h3>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Add ${recipe.name} to the current order`}
          title="Add to the current order"
          onClick={() => addDish(recipe.id)}
        >
          <Plus />
        </Button>
      </div>
      <ul className="mt-1.5 space-y-1 font-sans text-xs text-muted-foreground">
        {single.gather.length > 0 && (
          <Step phase="gather">
            {single.gather
              .map(
                (line) =>
                  `${line.need > 1 ? `${line.need} ` : ""}${ITEMS[line.item].name}`
              )
              .join(", ")}
          </Step>
        )}
        {byPhase("prep").map((text) => (
          <Step key={text} phase="prep">
            {text}
          </Step>
        ))}
        {byPhase("cook").map((text) => (
          <Step key={text} phase="cook">
            {text}
          </Step>
        ))}
        <Step phase="plate">{recipe.serve}</Step>
      </ul>
    </article>
  )
}

export function RecipeSheet() {
  const [query, setQuery] = useState("")
  const results = useMemo(() => searchRecipes(query), [query])

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <BookOpen /> <span className="hidden sm:inline">Recipes</span>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Recipes</SheetTitle>
          <SheetDescription>
            Everything each dish needs, from pantry to plate.
          </SheetDescription>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter recipes"
            className="mt-2"
          />
        </SheetHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          {CATEGORIES.map((category) => {
            const recipes = results.filter(
              (recipe) => recipe.category === category
            )
            if (!recipes.length) return null
            return (
              <section key={category} className="space-y-2">
                <h2 className="font-sans text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {category}
                </h2>
                {recipes.map((recipe) => (
                  <RecipeEntry key={recipe.id} recipe={recipe} />
                ))}
              </section>
            )
          })}
          {!results.length && (
            <p className="py-10 text-center font-sans text-sm text-muted-foreground">
              No recipe matches “{query}”.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
