import {
  Flame,
  ShoppingBasket,
  Slice,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

import type { Phase } from "@/data/stations"

export const PHASE_ICONS: Record<Phase, LucideIcon> = {
  gather: ShoppingBasket,
  prep: Slice,
  cook: Flame,
  plate: UtensilsCrossed,
}

/** Tint for the station pill on a card, one per phase. */
export const PHASE_TINTS: Record<Phase, string> = {
  gather: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  prep: "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200",
  cook: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  plate:
    "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
}
