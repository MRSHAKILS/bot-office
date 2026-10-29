# Upgrade notes — Fishbowl + custom stations + bot identities

## Shipped
- **Fishbowl glass**: physical-material glass curtain on the south and east edges (5 m / 4 m panes, light frames top+bottom, slim dark posts), an entry gap on each side, two glass ribs between lounge and work zones. Lead office glass uses the same material.
- **Per-bot workstations** (`src/office/stations.ts`): desk finish (oak/white/walnut/black/steel), shape (rect/L/standing), chair (task/gaming/stool/executive/ball), monitors (flat/ultrawide/curved/vertical/laptop) with animated canvas screens per theme (ops, calendar, code, hardware, fitness, lab, docs, timeline, charts), tower (slim/gaming with fan rings/aluminum/lab with coolant vial) + LED, underglow strips + soft floor glow + PointLight (0.5, 3 m), pendant lamp, 2–3 signature props.
- **Bot identities** (`src/bots/styles.ts`): Alfred suit vest + tie, niẓām dark coat, NSU beanie + bag strap, Lamar backpack straps + cap, Victoria blazer, Mentor scarf + glasses, Fitness headband/wristbands, Mibot hoodie, Ram-Hunt glowing visor + antenna, eggbot lab coat with red stripe. Coloured shoes per bot. Gait/pathing untouched.
- Desk origins unchanged (`z.x, z.z-0.75`, lead `-16,-11.35`) so seats/paths still line up.

## Adding a new bot
1. Add the member to `src/bots/team.ts` (and a zone in `layout.ts` if new dept).
2. Add `STATIONS['<id>']` in `src/office/stations.ts` (falls back to `DEFAULT_STATION`).
3. Add `BOT_STYLES['<short>']` in `src/bots/styles.ts` (optional; plain body otherwise).
4. `npm run build`, redeploy.
