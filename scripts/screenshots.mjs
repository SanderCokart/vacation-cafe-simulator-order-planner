// Builds the app, serves it, and captures README screenshots with headless
// Chromium in light and dark. Run with `pnpm screenshots`; images land in
// docs/screenshots/. First time only: `pnpm exec playwright install chromium`.
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium } from "playwright"
import { build, preview } from "vite"

const root = resolve(import.meta.dirname, "..")
const out = resolve(root, "docs/screenshots")
const PORT = 4179
const URL = `http://localhost:${PORT}/`

const minute = 60_000
const start = Date.UTC(2026, 9, 29, 17, 0, 0)
const log = [
  [0, "order", "Table 1: added Chianti"],
  [0.2, "order", "Table 1: added Bruschetta with Tomatoes"],
  [0.4, "order", "Table 1: added Pasta Carbonara"],
  [1, "order", "New Table 2"],
  [1.2, "order", "Table 2: added Margherita Pizza"],
  [2, "wave", "Drinks wave 1 started (table priority, up to 8 of 10 slots)"],
  [2.1, "wave", "Drinks wave 1 · Pickup collected: 1 Chianti bottle 3/5, 1 Coffee beans"],
  [3.4, "wave", "Drinks wave 1 · Coffee grinder done: 1 Coffee beans"],
  [4.6, "wave", "Drinks wave 1 · Coffee machine done: 2 Espresso, 1 Cappuccino"],
  [5.5, "wave", "Drinks wave 1 · Serve drinks done: 2 Chianti, 2 Espresso, 1 Cappuccino"],
].map(([at, kind, text]) => ({ at: start + at * minute, round: 3, kind, text }))

/** The app's saved state: four tables, some spares, nothing started yet. */
const demoState = {
  state: {
    orders: [
      {
        id: "t1",
        number: 1,
        label: "Table 1",
        lines: [
          { recipeId: "chianti", qty: 2 },
          { recipeId: "tomatoBruschetta", qty: 2 },
          { recipeId: "carbonara", qty: 2 },
        ],
      },
      {
        id: "t2",
        number: 2,
        label: "Table 2",
        lines: [
          { recipeId: "espresso", qty: 2 },
          { recipeId: "prosecco", qty: 1 },
          { recipeId: "margherita", qty: 1 },
          { recipeId: "capricciosa", qty: 1 },
        ],
      },
      {
        id: "t3",
        number: 3,
        label: "Table 3",
        lines: [
          { recipeId: "cappuccino", qty: 1 },
          { recipeId: "insalataDiMare", qty: 1 },
          { recipeId: "tiramisu", qty: 1 },
        ],
      },
      {
        id: "t4",
        number: 4,
        label: "Table 4",
        lines: [
          { recipeId: "lasagna", qty: 1 },
          { recipeId: "caprese", qty: 2 },
          { recipeId: "chocolateCroissant", qty: 1 },
        ],
      },
    ],
    currentOrderId: "t4",
    nextNumber: 5,
    waves: [],
    spares: [
      { id: "s1", item: "cacao", amount: 1 },
      { id: "s2", item: "cacao", amount: 2 },
      { id: "s3", item: "milk", amount: 2 },
      { id: "s4", item: "groundCoffee", amount: 5 },
      { id: "s5", item: "chiantiBottle", amount: 3 },
      { id: "s6", item: "cookedSpaghetti", amount: 1 },
    ],
    mode: "table",
    round: 3,
    log,
  },
  version: 3,
}

async function shoot(browser, scheme) {
  const suffix = scheme === "dark" ? "-dark" : ""
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
  })
  await context.addInitScript((state) => {
    localStorage.setItem("vacation-cafe-planner", JSON.stringify(state))
  }, demoState)
  const page = await context.newPage()
  await page.goto(URL)
  await page.addStyleTag({
    content: "*,*::before,*::after{transition:none!important;animation:none!important}",
  })
  const save = (name, options = {}) =>
    page.screenshot({ path: resolve(out, `${name}${suffix}.png`), ...options })

  // Wave 1 (drinks): pickup with spares from the counter and new items.
  await page.getByText("Pickup", { exact: true }).first().waitFor()
  await save("pickup")

  // A food wave whose plate card picks a table back up from the counter.
  const next = page.getByRole("button", { name: "Next wave" })
  for (let tries = 0; tries < 8; tries++) {
    await page.getByRole("tab", { name: /Plate/ }).click()
    if (await page.getByText("Pick up from the counter").count()) break
    if (await next.isDisabled()) break
    await next.click()
  }
  await save("plate")

  // Spotlight-style search while building an order.
  await page.getByRole("button", { name: "Previous wave" }).click()
  await page.getByRole("combobox").click()
  await page.keyboard.type("pas")
  await save("search", { clip: { x: 0, y: 0, width: 1440, height: 560 } })
  await page.keyboard.press("Escape")

  // Recipe library and step log sheets.
  await page.getByRole("button", { name: "Recipes", exact: true }).click()
  await page.getByRole("dialog").waitFor()
  await save("recipes")
  await page.keyboard.press("Escape")
  await page.getByRole("dialog").waitFor({ state: "hidden" })
  await page.getByRole("button", { name: "Log", exact: true }).click()
  await page.getByRole("dialog").waitFor()
  await save("log")

  await context.close()
}

/** GitHub's social preview size, light mode only. */
async function socialPreview(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 640 },
    deviceScaleFactor: 1,
  })
  await context.addInitScript((state) => {
    localStorage.setItem("vacation-cafe-planner", JSON.stringify(state))
  }, demoState)
  const page = await context.newPage()
  await page.goto(URL)
  await page.getByText("Pickup", { exact: true }).first().waitFor()
  await page.screenshot({ path: resolve(out, "social-preview.png") })
  await context.close()
}

await mkdir(out, { recursive: true })
await build({ root, logLevel: "warn" })
const server = await preview({
  root,
  preview: { port: PORT, strictPort: true },
  logLevel: "warn",
})
const browser = await chromium.launch()
try {
  for (const scheme of ["light", "dark"]) await shoot(browser, scheme)
  await socialPreview(browser)
  console.log(`Screenshots saved to ${out}`)
} finally {
  await browser.close()
  server.httpServer.close()
}
