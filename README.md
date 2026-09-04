# TripUp

A working prototype of **TripUp** — a group-travel app for planning trips together: a shared itinerary, polls for group decisions, and expense splitting that settles up in a few taps.

Built for a product design challenge. Everything runs on mock data in memory, so **refreshing resets the demo to its starting state**.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Designed for iPhone 14 (390×844) — on a desktop browser it renders inside a phone frame; on a phone it goes full-bleed.

## The scenario

You're **Ari**, on the last evening of a week in Lisbon with four friends. The plan for tonight's dinner hasn't been made yet.

1. **Home** — the active trip surfaces what's happening now: which day you're on, what's next, what you owe.
2. **Itinerary** — the trip day by day. Tap through the day strip; Saturday is deliberately missing a dinner.
3. **Chat** — add **Ren**, who's joining for the final dinner, then start a poll with three restaurants. Votes come in live; anyone can add an option mid-poll. When the poll closes, the winner is written straight into Saturday's itinerary.
4. **Expenses** — log the dinner as two line items, and exclude Nic and Ren from the wine. Balances update immediately.
5. **Settle up** — TripUp consolidates everyone's debts into the fewest possible transfers (5 instead of 12), and settling clears them on the spot.

## Notes

- Amounts are held in the trip's currency (EUR) with a home-currency estimate alongside (`€43.00 ≈ $46.50`).
- No accounts, no backend, no real payments — settlement is recorded, not processed.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Zustand

## Checks

```bash
npm run build
npx eslint app components lib
npx tsx scripts/verify-settle-flow.ts        # balances + consolidated transfers
npx tsx scripts/verify-confirmation-guard.ts # settle-up completion state
```
