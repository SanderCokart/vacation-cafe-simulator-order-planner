import { ClientThemeProvider } from "@wrksz/themes/client"
import type { ReactNode } from "react"

/** Follows the system light or dark setting; there is no manual toggle. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ClientThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storage="none"
      disableTransitionOnChange
    >
      {children}
    </ClientThemeProvider>
  )
}
