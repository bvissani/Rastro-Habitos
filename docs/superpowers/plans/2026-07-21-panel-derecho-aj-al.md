# Reversión panel derecho (AJ–AL) — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rehacer el panel derecho (cols AJ–AL) de la hoja Enero para acercarlo a la captura de referencia: barras limpias en "Progreso Completado" y una dona flotante en "Progreso Mensual" con el número debajo.

**Architecture:** Un solo archivo `.gs` de Apps Script. Todos los cambios viven en `buildProgressPanels_`. Se retoca el bloque "Progreso Completado" (barra ancha + %, sin `x/31`) y se reemplaza el bloque "Progreso Mensual" (antes: % grande + SPARKLINE) por una **dona flotante nativa** (`Charts.ChartType.PIE` con `pieHole`) más celdas de número/porcentaje debajo del anillo. Se llama a `clearCharts_(sh)` antes de crear la dona.

**Tech Stack:** Google Apps Script (`SpreadsheetApp`, `Charts`), desplegado con `clasp`.

## Global Constraints

- **Deliverable = una plantilla para compartir**: robustez sin dependencias externas por encima de la copia pixel-perfect.
- **Sin dependencias externas nuevas**: la dona es un gráfico nativo, no `IMAGE()` de URL externa.
- **Verificación local = solo sintaxis**: `cp "Rastreo Habitos - Apps Script.gs" /tmp/check.js && node --check /tmp/check.js`. No hay framework de tests. La prueba real es que el usuario ejecute `buildTemplate` y reporte.
- **Push tras cada edición**: `clasp push -f`. Nunca afirmar que "funciona" — solo el usuario ejecutando `buildTemplate` lo prueba.
- **Alcance**: solo `buildProgressPanels_`. No tocar Config, Anual Dashboard, la grilla, ni Resumen General.
- **No usar** opciones de chart `chartArea.bottom` / `chartArea.right` (Apps Script las rechaza).
- **Geometría** vive en `G`; usar `a1(row,col)` para refs A1. `RC = G.RIGHT_COL = 36` (AJ), `MC = 40` (AN, col técnica de cálculo, texto blanco).

---

## File Structure

- **Modify:** `Rastreo Habitos - Apps Script.gs` — función `buildProgressPanels_` (líneas ~489–519). Único archivo de código del proyecto.
- **Modify:** `CLAUDE.md` — documentar la dona como excepción intencional (antes prohibía todo chart flotante). Sin esto, una sesión futura revierte la dona por creerla un bug.
- `clearCharts_(sh)` ya existe (línea 129) y hoy no se llama en ningún lado; este plan lo empieza a usar.

---

### Task 1: Progreso Completado — barra ancha + %, sin "x/31"

**Files:**
- Modify: `Rastreo Habitos - Apps Script.gs` (bloque "PROGRESO COMPLETADO", líneas ~494–504)

**Interfaces:**
- Consumes: `RC` (=36, AJ), `NHAB`, `pcHdr` (=11), `G.HABIT_START`, `G.DAYS`, `PALETTE.week[0]`, `a1()` — todos ya definidos en `buildProgressPanels_`.
- Produces: nada nuevo para tareas posteriores.

- [ ] **Step 1: Reemplazar el loop del bloque "Progreso Completado"**

Reemplazar exactamente este bloque:

```js
  for (var i = 0; i < NHAB; i++) {
    var hr = pcHdr + 1 + i; // 12..21
    var cnt = a1(G.HABIT_START + i, 3); // conteo del hábito (col C)
    sh.getRange(hr, RC).setFormula(
      '=SPARKLINE(' + cnt + ',{"charttype","bar";"max",' + G.DAYS +
      ';"color1","' + PALETTE.week[0] + '"})');
    sh.getRange(hr, RC + 1).setFormula('=IFERROR(' + cnt + '/' + G.DAYS + ',0)')
      .setNumberFormat('0.00%').setFontSize(8).setHorizontalAlignment('center');
    sh.getRange(hr, RC + 2).setFormula('=' + cnt + '&"/"&' + G.DAYS)
      .setFontSize(8).setHorizontalAlignment('center');
  }
```

por:

```js
  for (var i = 0; i < NHAB; i++) {
    var hr = pcHdr + 1 + i; // 12..21
    var cnt = a1(G.HABIT_START + i, 3); // conteo del hábito (col C)
    // Barra azul ancha (AJ:AK merge) + % (AL). Sin "x/31" para replicar la referencia.
    sh.getRange(hr, RC, 1, 2).merge().setFormula(
      '=SPARKLINE(' + cnt + ',{"charttype","bar";"max",' + G.DAYS +
      ';"color1","' + PALETTE.week[0] + '"})');
    sh.getRange(hr, RC + 2).setFormula('=IFERROR(' + cnt + '/' + G.DAYS + ',0)')
      .setNumberFormat('0.00%').setFontSize(8).setHorizontalAlignment('center')
      .setFontColor(PALETTE.text);
  }
```

- [ ] **Step 2: Gate de sintaxis**

Run:
```bash
cp "Rastreo Habitos - Apps Script.gs" /tmp/check.js && node --check /tmp/check.js
```
Expected: sin salida (exit 0). Cualquier error de sintaxis se corrige antes de seguir.

- [ ] **Step 3: Push**

Run:
```bash
clasp push -f
```
Expected: `Pushed 2 files.` (el `.gs` y `appsscript.json`).

- [ ] **Step 4: Verificación manual (usuario)**

Pedir al usuario: menú **🎯 Rastreador → Reconstruir**. Confirmar que en "Progreso Completado" cada hábito muestra una **barra azul ancha (AJ:AK)** y el **%** a la derecha (AL), **sin** la columna `x/31`. Reportar screenshot.

---

### Task 2: Progreso Mensual — dona flotante + número debajo

**Files:**
- Modify: `Rastreo Habitos - Apps Script.gs` (bloque "PROGRESO MENSUAL", líneas ~506–519)

**Interfaces:**
- Consumes: `RC` (=36, AJ), `MC` (=40, AN), `NHAB`, `pcHdr` (=11), `PALETTE.week[0]`, `PALETTE.maroon`, `a1()`, `clearCharts_(sh)` (línea 129). `a1(2,MC)`=AN2 (completado), `a1(3,MC)`=AN3 (total posible), `a1(4,MC)`=AN4 (% mensual) — ya calculados antes en la función (líneas 465–468).
- Produces: nada nuevo para tareas posteriores.

- [ ] **Step 1: Reemplazar el bloque "Progreso Mensual"**

Reemplazar exactamente este bloque:

```js
  /* ===== PROGRESO MENSUAL (derecha, debajo — % grande + barra, sin dona flotante) ===== */
  var pmRow = pcHdr + 1 + NHAB + 1; // 23 con 10 hábitos
  sh.getRange(pmRow, RC, 1, 3).merge().setValue('Progreso Mensual')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(10);
  sh.getRange(pmRow + 1, RC, 3, 3).merge().setFormula('=' + a1(4, MC))
    .setNumberFormat('0.00%').setFontSize(26).setFontWeight('bold').setFontColor(PALETTE.maroon)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.getRange(pmRow + 4, RC, 1, 3).merge()
    .setFormula('=' + a1(2, MC) + '&"/"&' + a1(3, MC))
    .setHorizontalAlignment('center').setFontSize(9).setFontColor(PALETTE.text);
  sh.getRange(pmRow + 5, RC, 1, 3).merge().setFormula(
    '=SPARKLINE(' + a1(2, MC) + ',{"charttype","bar";"max",' + a1(3, MC) +
    ';"color1","' + PALETTE.week[0] + '"})');
```

por:

```js
  /* ===== PROGRESO MENSUAL (derecha, debajo — DONA flotante + número debajo) ===== */
  var pmRow = pcHdr + 1 + NHAB + 1; // 23 con 10 hábitos
  sh.getRange(pmRow, RC, 1, 3).merge().setValue('Progreso Mensual')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(10);

  // Datos OCULTOS para la dona: 2 filas [etiqueta, valor] en col técnica AN/AO (texto blanco).
  sh.getRange(6, MC).setValue('Completado');
  sh.getRange(6, MC + 1).setFormula('=' + a1(2, MC));                     // completado
  sh.getRange(7, MC).setValue('Pendiente');
  sh.getRange(7, MC + 1).setFormula('=' + a1(3, MC) + '-' + a1(2, MC));   // pendiente
  sh.getRange(6, MC, 2, 2).setFontColor('#FFFFFF').setFontSize(8);

  // Dona flotante nativa (azul = completado, gris claro = pendiente). Sin leyenda/título.
  // clearCharts_ borra gráficos previos (defensivo: la hoja se recrea, pero evita huérfanos).
  clearCharts_(sh);
  var donut = sh.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(sh.getRange(6, MC, 2, 2))         // AN6:AO7
    .setNumHeaders(0)
    .setOption('pieHole', 0.62)
    .setOption('legend', { position: 'none' })
    .setOption('title', '')
    .setOption('pieSliceText', 'none')
    .setOption('colors', [PALETTE.week[0], '#E3E3E3'])
    .setOption('backgroundColor', '#FFFFFF')
    .setOption('width', 190)
    .setOption('height', 150)
    .setPosition(pmRow + 1, RC, 45, 4)          // ancla fila 24, col AJ; offset para centrar
    .build();
  sh.insertChart(donut);

  // Número (completado/total) y % centrados DEBAJO del anillo.
  sh.getRange(pmRow + 9, RC, 1, 3).merge()      // fila 32
    .setFormula('=' + a1(2, MC) + '&"/"&' + a1(3, MC))
    .setHorizontalAlignment('center').setFontSize(13).setFontWeight('bold')
    .setFontColor(PALETTE.maroon);
  sh.getRange(pmRow + 10, RC, 1, 3).merge()     // fila 33
    .setFormula('=' + a1(4, MC))
    .setNumberFormat('0%').setHorizontalAlignment('center').setFontSize(18)
    .setFontWeight('bold').setFontColor(PALETTE.week[0]);
```

- [ ] **Step 2: Gate de sintaxis**

Run:
```bash
cp "Rastreo Habitos - Apps Script.gs" /tmp/check.js && node --check /tmp/check.js
```
Expected: sin salida (exit 0).

- [ ] **Step 3: Push**

Run:
```bash
clasp push -f
```
Expected: `Pushed 2 files.`

- [ ] **Step 4: Verificación manual (usuario)**

Pedir al usuario: menú **🎯 Rastreador → Reconstruir**. Confirmar en "Progreso Mensual":
- Una **dona** (anillo azul = completado, gris claro = pendiente), **sin** leyenda ni título, sin cajas flotantes viejas superpuestas.
- Debajo del anillo: **"246/341"** (completado/total) y **"72%"** centrados.
- La dona queda **centrada** sobre AJ–AL y no pisa el encabezado "Progreso Mensual" ni las celdas de número.

Reportar screenshot. Si la dona quedó descentrada o pisa celdas, ajustar en un paso de seguimiento los valores de `setPosition(pmRow + 1, RC, 45, 4)` (offset X/Y en px) y/o `width`/`height` (los píxeles son estimados y solo se verifican corriendo la hoja).

---

### Task 3: Actualizar CLAUDE.md — la dona es una excepción intencional

**Files:**
- Modify: `CLAUDE.md` (secciones "Everything is IN-CELL", lista de visuales, y "Gotchas")

**Interfaces:**
- Consumes: nada. Produces: nada. Es documentación para que sesiones futuras no reviertan la dona.

- [ ] **Step 1: Corregir la sección "Everything is IN-CELL — there are NO floating charts"**

Ese encabezado y su bajada ("Hard requirement from the user: **zero floating chart objects** (`newChart`/`insertChart`). They render as detached empty boxes...") pasan a admitir **una** excepción. Editar la bajada para que diga, en esencia:

> Casi todo es in-cell. **Única excepción intencional:** la dona de "Progreso Mensual" (panel derecho AJ–AL) es un gráfico flotante nativo (`Charts.ChartType.PIE` con `pieHole`), porque `SPARKLINE` no tiene tipo dona/pie. Se limpia con `clearCharts_(sh)` antes de recrearse y la hoja se recrea entera en cada build, así que no acumula huérfanos. **No reintroducir** ningún otro chart flotante para el resto de los visuales.

- [ ] **Step 2: Corregir la línea de "Progreso Mensual" en la lista de visuales**

Reemplazar:

> - **Progreso Mensual** (right panel): big `%` + a `SPARKLINE` bar (no donut).

por:

> - **Progreso Mensual** (right panel): **dona flotante** (pie con `pieHole`, azul = completado, gris claro = pendiente) + celdas `completado/total` y `%` centradas **debajo** del anillo (una dona nativa no puede rotular el centro).

- [ ] **Step 3: Ajustar el Gotcha de charts**

La línea de Gotchas que dice "Moot now that there are no charts, but don't reintroduce them" ya no aplica tal cual. Ajustarla para aclarar que **sí hay un chart** (la dona) y que la restricción vigente es: no usar opciones `chartArea.bottom`/`chartArea.right` (Apps Script las rechaza), y no agregar OTROS charts flotantes.

- [ ] **Step 4: Verificación**

Releer las tres secciones editadas de `CLAUDE.md` y confirmar que ya no contradicen el código (no queda ninguna afirmación de "cero charts" / "no donut"). No hay push: `CLAUDE.md` no se sube con clasp (solo `.gs` + `appsscript.json`).

---

## Notas de ejecución

- Las Tasks 1 y 2 son independientes y revisables por separado (tocan bloques distintos de la misma función). Se pueden implementar y verificar en orden. La Task 3 (docs) conviene hacerla al final, una vez confirmado el encuadre de la dona con el usuario.
- Este proyecto **no es repo git**: no hay paso de commit. El "commit" del flujo TDD se sustituye por `clasp push -f`.
- Los offsets/tamaño de la dona (`setPosition`, `width`, `height`) son estimaciones; solo el usuario corriendo `buildTemplate` confirma el encuadre. Esperar ese feedback antes de dar por cerrada la Task 2.
