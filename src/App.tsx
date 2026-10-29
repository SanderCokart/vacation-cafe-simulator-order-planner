import { ChefHat } from "lucide-react"

import { FocusView } from "@/components/focus-view"
import { OrderRail } from "@/components/order-rail"
import { RecipeSearch } from "@/components/recipe-search"
import { LogSheet } from "@/components/log-sheet"
import { RecipeSheet } from "@/components/recipe-sheet"

export function App() {
  return (
    <div className="flex min-h-svh flex-col md:h-svh">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ChefHat className="size-5 text-primary" />
          <span className="hidden font-medium lg:inline">
            Café prep planner
          </span>
        </div>
        <div className="flex justify-center">
          <RecipeSearch />
        </div>
        <div className="flex items-center gap-2">
          <LogSheet />
          <RecipeSheet />
        </div>
      </header>
      <div className="grid min-h-0 flex-1 md:grid-cols-[18rem_minmax(0,1fr)]">
        <OrderRail />
        <main className="min-h-0 overflow-y-auto">
          <FocusView />
        </main>
      </div>
    </div>
  )
}

export default App
