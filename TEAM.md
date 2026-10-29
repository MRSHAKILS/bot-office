# Bot Office team

| # | Bot | Role (real job) | Office color | Department (carpet) | Accessory | Notes |
|---|---|---|---|---|---|---|
| 1 | Alfred (lead) | Bot Chief Advisor — ops lead, routes work | gray `#6b7280` | Ops · Lead (glass corner office) | clipboard | |
| 2 | niẓām | Life / personal assistant | black `#1a1a1a` | Life | calendar | light eyes so the face reads |
| 3 | NSU · Study buddy | NSU study buddy | blue `#3b82f6` | School NSU | textbook | |
| 4 | Lamar | Other-university study | teal `#14b8a6`* | School Uni | backpack | |
| 5 | Victoria | Deadlines tracker | violet `#8b5cf6`* | Deadlines | clock | |
| 6 | Mentor | Personal growth mentor | green `#22c55e`* | Growth | whiteboard marker | also owns QA interview prep |
| 7 | Fitness | Health & fitness coach | orange `#f97316` | Health | water bottle | |
| 8 | Mibot | Engineering · GitHub | light gray `#9ca3af` | Engineering | laptop | lighter than Alfred so they differ |
| 9 | SWE | Software engineer — code, deploys | sky `#0ea5e9` | Software (own zone, east of Bot Lab) | laptop | hoodie; no longer shares Engineering |
| 10 | Ram-Hunt | Hardware · RAM stock hunter | magenta `#d946ef` | Hardware | SO-DIMM stick | |
| 11 | dr eggbot | Bot Lab · bot designer | red `#ef4444` | Bot Lab | flask | |

\* Assumptions: Lamar, Victoria and Mentor had no profile color, so these are stand-in colors used only in the office.
- The niẓām calendar accessory stands in for the prayer mat, which is hard to read at this size.
- Status is matched by agent id (in `src/bots/team.ts`, also the Worker `ROSTER`) or by exact name.

> New bot? Add it to `src/bots/team.ts` (+ `seatOffset` if sharing a zone), a station in `src/office/stations.ts`, a style in `src/bots/styles.ts`, the Worker `ROSTER`, and a lounge seat in `src/office/layout.ts`.
