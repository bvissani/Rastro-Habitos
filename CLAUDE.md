# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Google Apps Script** that generates an animated habit-tracker spreadsheet (a replica of the
"Hikari Sekai" anime-themed template) inside the user's Google Sheet. The whole deliverable is one
file: `Rastreo Habitos - Apps Script.gs`. There is **no build, test, lint, or package tooling** — it
is standalone `.gs` code that runs inside the Sheet's Apps Script runtime.

- `Imagenes de ejemplo/` — reference screenshots of the target design. Master references:
  `SINTITULO 12.jpg` (labeled infographic) and `Sin título.jpg` (full Enero mockup, Goku). The
  bottom "Resumen General" block was matched against the Levi reference the user sent in-chat.
- Target Google Sheet: `https://docs.google.com/spreadsheets/d/1LB4E57bcb51ZrsLLaLWFYPZzRuRI8A8ak9RXSBAuMAk`
- Most characters are still **placeholder Twemoji emojis** on purpose — swap real anime art later by
  editing URLs in `Config!PERSONAJES`. Do not block on image fidelity; focus on mechanics/layout.
- **`CHARACTERS` entries may be a Twemoji code OR a full `http(s)` URL** — `imgUrl()` (near
  `twemojiUrl`) passes URLs through untouched and only twemoji-expands bare codes. **Naruto** is
  already populated with real art: 6 jsDelivr URLs (repo `vikhyatsingh123/Naruto-Shippuden`, pinned
  to commit `09c52b1`) mapping a power progression base→Six-Paths. jsDelivr is one of the hosts
  Google Sheets `IMAGE()` renders reliably — prefer it (or Wikimedia) when adding more real art.

## How it's deployed — clasp (this is the current workflow)

Deployment is automated with **clasp** (Google's Apps Script CLI). Claude edits the `.gs` locally
and pushes it straight into the bound script project; the user only clicks Run.

- **Config already in the repo**: `.clasp.json` (scriptId + rootDir) and `appsscript.json` (manifest).
  - `scriptId`: `1jT3l_evY2Bdzj4OSDATgNpE3nvWRVy4ORqmCb8FO6FegUgbUeIQE6lG8` (the **bound script**, not
    the spreadsheet id).
  - clasp auth lives in `~/.clasprc.json`, logged in as **`brianvissani@gmail.com`** (has access to
    the script even though the sheet owner is `comercial@conbrex.com`).
- **Push loop** (what Claude does after every edit):
  ```bash
  cp "Rastreo Habitos - Apps Script.gs" /tmp/check.js && node --check /tmp/check.js   # syntax gate
  clasp push -f                                                                        # upload
  ```
  `clasp status` shows exactly two tracked files: the `.gs` and `appsscript.json`.
- **Running it**: Claude **cannot** run the function from here. `clasp run` needs a separate GCP
  standard project + API-executable deployment (not set up). So the user runs **`buildTemplate`**
  manually: menu **🎯 Rastreador → Reconstruir**, or ▶ Run in the Apps Script editor. The loop is:
  Claude edits → `clasp push` → user runs → user reports the error/screenshot → repeat.
- Pushing renames the remote file from `Código` to `Rastreo Habitos - Apps Script` (cosmetic; Apps
  Script doesn't care about file names for global functions).
- **Local verification is syntax-only** (`node --check` on a copy). Every real failure this project
  hit is a Sheets-runtime error that only surfaces when the user runs it — see "Gotchas" below.

## Architecture of the script

`buildTemplate()` orchestrates three sheets, built in this order (order matters — later sheets
reference named ranges created by earlier ones):

1. **`Config`** (hidden) — `buildConfigSheet`. Lookup tables: `PERSONAJES` (name, big-image URL,
   6 evolution-stage URLs) and evolution thresholds. Creates named ranges `CHAR_TABLE` (A2:H14) and
   `CHAR_NAMES` (A2:A14). Support infrastructure, not a content tab.
2. **`Anual Dashboard`** — `buildAnualDashboard`. Year input, the "Elige tu personaje:" dropdown
   (data validation against `CHAR_NAMES`), the big character image, and a 12-month summary. The
   dropdown cell becomes the named range **`PERSONAJE`**, which drives images everywhere. The Enero
   row of the summary reads `Enero!$AN$2` (completado) and `Enero!$AN$4` (%). The year cell (`C3`) is
   the named range **`ANIO`** — it is **live/dynamic**: every weekday label and the month box read it
   via formula, so editing the year re-labels the whole calendar without a rebuild.
3. **`Enero`** — `buildMonthSheet` + `buildProgressPanels_`. The main grid and all panels.

### `getOrCreateSheet` RECREATES sheets (do not go back to clear())

`getOrCreateSheet` **deletes the old sheet and inserts a fresh one** (`insertSheet()` → `deleteSheet(old)`
→ `setName`). This is deliberate: `clear()`/`clearFormats()` do **not** remove merged cells, data
validations (checkboxes), frozen rows/cols, or conditional-format rules, and leftovers from a prior
layout caused "Cannot merge intersecting ranges" and "content violates its validation rule" errors.
Recreation is the only reliably idempotent reset. Keep it.

### Everything is IN-CELL — with TWO intentional floating charts

Almost every visual is drawn inside cells. There are **two deliberate floating-chart exceptions**,
both native and both because `SPARKLINE` can't do the shape:
1. The **Progreso Mensual donut** (right panel `AJ:AL`) — `Charts.ChartType.PIE` with `pieHole`.
2. The **top trend area chart** (band `D1:AH5`) — `Charts.ChartType.AREA`, smooth green fill of the
   daily %, built in `buildTrendChart_` from a hidden vertical table (day, %) in cols `AP:AQ`. The
   stepped conditional-format fill stays underneath as a fallback. **Rows are NOT frozen** precisely
   because of this: a floating chart anchored inside a frozen row band gets pushed below the divider
   and renders broken. Only columns A–C are frozen. Keep it that way — freezing rows breaks this chart.

`clearCharts_(sh)` (called once in `buildProgressPanels_`) clears old charts before the donut; both
charts are created after it and the whole sheet is recreated each build, so no orphans accumulate.
**Do not** add floating charts for any OTHER visual — they render as detached empty boxes over the
grid. All the rest is drawn inside cells:

- **Daily-% trend** (band `D1:AH5`): a floating green **AREA chart** (`buildTrendChart_`, `curveType
  function`, `width 848`, anchored at `D1`) sits on top; the 848px width (vs 806 = 31×26) pushes the
  plot's fixed right margin out so the fill reaches AH/AI (chartArea is unusable — see Gotchas).
  **Underneath** it, `applyWeekConditionalFormatting_` still paints the stepped fallback — five rules
  fill each day column's cells green from the bottom (row 5) up (row 1) at thresholds
  `>0, >0.2, >0.4, >0.6, >0.8` of that column's `PCT_ROW` value.
- **Resumen General bars** (`D26:AH33`): one **`SPARKLINE` column per day cell** (each day column is
  merged tall), single value = that day's `Total/día`, `ymax = NUM_HABITOS`, colored by its week.
  (A single sparkline spanning all 31 days looked like thin gapped bars — the user rejected that;
  one solid bar *per day cell* is what matches the reference.)
- **Progreso Completado** (right panel `AJ:AL`): per habit a wide `SPARKLINE` bar merged across
  `AJ:AK` + `%` in `AL` (the `x/31` column was dropped to match the reference).
- **Progreso Mensual** (right panel): a **big floating donut** (`PIE` with `pieHole`, blue =
  completado, light gray = pendiente, `width/height 265`, anchored `AJ24`) sized to fill the whole
  Resumen General band; fed by hidden data cells `AN6:AO7`, with `completado/total` (row 38) and `%`
  (row 39) centered *below* the ring (a native donut cannot label its center). No `SPARKLINE` bar.
- **Progreso Semanal** (rows 37–39, three rows per week): `X/Y` (completados/total), `%`, and a
  horizontal `SPARKLINE` **bar** (reads the week's `%` cell, `max 1`, week color). Label merges A–C
  across all three rows.
- **Checkbox grid** (`D11:AH20`): every cell gets its week's **soft** background (`weekSoft`) per
  column; the conditional-format rule then paints **checked** cells the **solid** week color on top.

`SPARKLINE` has **no filled-area type** (only line/column/bar/winloss). A smooth filled area is only
possible as a floating chart (the two we allow: donut + trend area) — hence the stepped
conditional-format fallback under the trend.

### Character evolution + images (reward system)

- **Thresholds are NON-linear and live in Config**: `EVO_THRESHOLDS = [0,.15,.35,.55,.75,.95]` →
  `Config!K2:K7` = named range **`EVO_UMBRALES`**. Every image picks its stage with
  `2+MATCH(pct, EVO_UMBRALES, 1)` (never `FLOOR(pct/0.2)` anymore).
- **Stage names**: `CHARACTERS[i][3]` (optional, else `DEFAULT_STAGE_NAMES`) → `Config!O2:T14` =
  named range **`STAGE_NAMES`** (rows aligned with `CHAR_NAMES`).
- **Daily avatar** (`AVATAR_ROW`): stage from that day's %; **blank on future days** with 0 checks.
  CF: perfect day (100%) = gold avatar + gold day number; past day with 0 checks = gray avatar.
- **Big images use the PACE %, not the whole-month %** (the old `AN4` made the final form appear
  only on Jan 31). Technical cells in col AN:
  - `AN5` frontier day = `MAX(today's day-of-Jan, last day with any check)` capped 0..31.
  - `AN8` checks on the frontier day. `AN9` **pace %** = `MAX(done excl. frontier / days before,
    done / days incl. frontier)` → checking never lowers it; closed month (today > Jan 31) = `AN4`.
  - `AN10` stage (1..6) from `AN9`. `AN14` habits still needed today for next stage. `AN15`
    progress inside the current stage (0..1). `AN13` = `ANIO` (CF formulas use it, not the named range).
  - Streak: hidden `AR1:AR31` (day ≥ `STREAK_MIN` = 70%) and `AS1:AS31` (run length). `AN11`
    current streak (today not yet counted → yesterday's run), `AN12` best.
- Right panel top: `AJ2:AJ3` count, `AK2:AL3` 🔥 streak, `AJ4:AL7` big image (`AN10`), row 8
  "Etapa X/6 · name", row 9 gold progress `SPARKLINE` (`AN15`), row 10 "Faltan N hábitos…".
  Resumen General portrait also uses `AN10`.
- Anual Dashboard portrait: average of hidden col **K** (pace % per month; Enero = `Enero!AN9`) over
  the months already elapsed of `ANIO`.
- **`onEdit(e)` simple trigger** (no extra scopes) → `celebrateCheck_`: when a grid checkbox in
  Enero is ticked, toasts +1 / daily evolution / general evolution / perfect day / streak
  milestones (`STREAK_MILESTONES`). `paceJs_`/`stageJs_`/`streakAt_` mirror the sheet formulas —
  keep them in sync if the formulas change.
- Testing note: with `ANIO` in the past (e.g. 2026 viewed in Oct 2026) January is "closed", so pace
  = monthly %. Set `ANIO` to a future year to test pace behaviour (frontier = last checked day).
- `CHAR_TABLE` column 2 (the old "big-image" URL) is **unused** — every image reads the 6 stage
  columns (3–8). Real art is swapped only by editing those stage URLs in `Config!PERSONAJES`.

### Geometry lives in `G` (LATERAL layout)

The design is horizontal, not stacked. `G` is the single source of truth — change layout there, not
with scattered literals. `colLetter`/`a1` build A1 refs from indices.

- **Cols A–C**: left panel (month box, habit names + `N.º`, Resumen General title + character image,
  Progreso Semanal labels). `FIRST_DAY_COL = 4` (D).
- **Cols D–AH** (`4..34`): the 31 days — trend band, avatars, week/day/weekday headers, checkbox
  grid, `Total/día`, Resumen General bars + Completado/Objetivo/Pendiente table.
- **Col AI** (`35`, `SPACER_COL`): free separator.
- **Cols AJ–AL** (`36..38`, `RIGHT_COL`): Hábitos completados, Progreso Completado, Progreso Mensual.
- **Col AN** (`40`): technical cells (white font): `AN1`=`NUM_HABITOS`, `AN2`=completado,
  `AN3`=total posible, `AN4`=monthly %. `AN6:AO7` = hidden donut data. `NUM_HABITOS` named range on
  `AN1`. **Cols AP:AQ** (`42:43`): hidden vertical (day, %) table feeding the trend area chart.
- Fixed rows: `TREND_ROWS [1,5]`, `PCT_ROW 6`, `AVATAR_ROW 7`, `WEEK_ROW 8`, `DAYNUM_ROW 9`,
  `WEEKDAY_ROW 10`, `HABIT_START 11`, `TOTAL_ROW 21`. Resumen block: header 23, day# 24, weekday 25,
  bars 26–33, Completado 34 / Objetivo 35 / Pendiente 36, Progreso Semanal 37 (`X/Y`) / 38 (`%`) /
  39 (bar). The bottom band now runs 23–39; the big donut fills the right side over that height.
- `WEEKS = [[4,10],[11,17],[18,24],[25,31],[32,34]]` (7,7,7,7,3 days). `ensureGrid_(sh, 50, 48)`
  widens the fresh sheet (a new sheet is only 26 cols / 1000 rows).
- Frozen: **only `setFrozenColumns(3)`** (A–C). Rows are intentionally NOT frozen — the top trend
  chart needs a non-frozen band (see the two-charts section). No merged cell may straddle the col C/D
  freeze line (see Gotchas).

## Gotchas (every one of these was a real runtime failure this session)

- **Out of bounds**: a new sheet has 26 cols (Z). Touching col 27+ throws "Those columns are out of
  bounds." → `ensureGrid_` must run before any wide operation.
- **Frozen + merge**: `setFrozenColumns` fails if a merged cell crosses the freeze line. Keep
  left-panel merges within cols A–C. (Rows are no longer frozen — that constraint is gone, but don't
  re-add `setFrozenRows`: it breaks the top trend chart.)
- **Floating chart in a frozen band**: a chart anchored inside frozen rows renders broken / pushed
  below the divider. This is why rows aren't frozen. Charts must be anchored in the scrollable area.
- **clear() is not a reset**: merges, checkbox validations, frozen state and conditional rules
  survive `clear()`. → recreate the sheet (see above).
- **Chart options**: never set `chartArea` at all on these charts — in this Apps Script runtime it
  renders the chart **blank** (not just the deprecated `chartArea.bottom`/`right`; even
  `left/top/width/height` blanked the trend area chart). To control plot coverage, size the chart via
  `width`/`height` + `setPosition` instead. There are two charts (Progreso Mensual donut + top trend
  area); don't add more floating charts for the rest of the visuals.
- **Named ranges resolve at recalc**, not at write time — writing a formula that references
  `NUM_HABITOS` before that named range exists is fine.
- **Objetivo** in Resumen General is currently `NUM_HABITOS` (all habits); Pendiente = Objetivo −
  Completado. The reference used a fixed daily goal of 7 — open question with the user.
- **Rebuild overwrites in-sheet edits**: habit names typed into column A revert to the `HABITS`
  constant on the next `buildTemplate`. Edit `HABITS` in code for persistent changes.

## Editing conventions

- Tunable content is grouped in top-level constants: `PALETTE`, `HABITS` (10 generic, editable),
  `CHARACTERS`, `EVO_THRESHOLDS`. Adjust these, not inlined values.
- After editing, always `node --check` a copy, then `clasp push -f`. Never claim it "works" — only
  the user running `buildTemplate` proves that; report what was pushed and ask them to run.
- Current scope is **only Anual Dashboard + Enero**. Feb–Dic are not built; the annual summary leaves
  them at 0. New months should reuse `buildMonthSheet`. When generalizing it: pass the **month number**
  (weekday labels already use `weekdayFormula_(mes, dia)` — Enero hardcodes `1`), parameterize the
  month box `"ENERO"` string, and drive the **day count per month** (28/30/31, and **February leap
  year** = `DAY(EOMONTH(DATE(ANIO,mes,1),0))`) instead of the fixed `G.DAYS = 31`. The week groupings
  (`WEEKS`, fixed 7-day chunks by day number) do NOT depend on the year — leave them.

## Apps Script OAuth scopes

`appsscript.json` declares the scopes the script needs when the user authorizes it:

- `https://www.googleapis.com/auth/spreadsheets.currentonly` — read/manage the bound spreadsheet
  (all the `SpreadsheetApp` work: sheets, ranges, checkboxes, named ranges, conditional formatting,
  data validation, `toast`).
- `https://www.googleapis.com/auth/script.container.ui` — the `onOpen` custom menu (`getUi`).

If you add API calls that need more (e.g. `UrlFetchApp`, Drive), add the matching scope here or the
run will fail with a permission error. Changing scopes makes the next run re-prompt for authorization
(expected, harmless).
