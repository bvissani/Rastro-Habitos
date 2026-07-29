# Reversión del panel derecho (columnas AJ–AL) — Diseño

**Fecha:** 2026-07-21
**Archivo afectado:** `Rastreo Habitos - Apps Script.gs` (función `buildProgressPanels_`)
**Objetivo:** Acercar el panel derecho (AJ, AK, AL) a la captura de referencia del usuario,
convirtiéndolo en una plantilla **funcional y robusta para compartir con otras personas**.

## Contexto y criterio rector

El deliverable es una plantilla que va a circular entre varias personas, que la van a
**Reconstruir** repetidamente desde el menú. Por eso el criterio principal es **robustez sin
dependencias externas** por encima de la copia pixel-perfect de la referencia.

## Alcance

Solo se rehace el panel derecho (cols AJ–AL = `G.RIGHT_COL` 36–38), sus tres bloques:
`Hábitos completados`, `Progreso Completado`, `Progreso Mensual`. El resto de la hoja (grilla,
Resumen General, Anual Dashboard, Config) **no se toca**.

## Los tres bloques

### 1. Hábitos completados (arriba)
Sin cambios estructurales. Se mantiene: encabezado marrón, número grande (suma de tildes del mes)
e imagen del personaje debajo, con borde marrón. Ya coincide con la referencia.

### 2. Progreso Completado (medio) — retoque visual
Una fila por hábito. Cada fila: **barra horizontal in-cell (`SPARKLINE`)** + **porcentaje**.
Cambios respecto a lo actual:
- Color de la barra a **azul** (coincidir con la captura), en vez del color de semana.
- El `x/31` se **quita** para dejar el bloque tan limpio como la referencia (barra + %).

### 3. Progreso Mensual (abajo) — cambio grande: dona flotante
- **Dona flotante real** (gráfico de torta con `pieHole`), 2 porciones: completado (**azul**) vs
  pendiente (**gris claro**), sin leyenda, sin título, anclada sobre el bloque AJ–AL.
- **Número central:** una dona flotante nativa de Google Sheets **no puede** renderizar texto
  dentro del agujero (el gráfico es un raster que se dibuja sobre la grilla y tapa las celdas de
  atrás; no hay etiqueta central nativa). Por eso el `246/341` y el `72%` van en **celdas centradas
  justo debajo del anillo**, no adentro. Es el único desvío cosmético respecto a la referencia, a
  cambio de que **nunca dependa de un servicio externo**.
- **Limpieza en cada Reconstruir:** el script **elimina los gráficos flotantes existentes de la hoja
  antes de crear el nuevo**, para no acumular donas ni dejar cajas huérfanas (el motivo original por
  el que se habían prohibido los charts flotantes).

## Decisiones descartadas (y por qué)

- **Dona con `IMAGE()` + QuickChart:** daría copia exacta con texto central, pero depende de un
  servicio externo + internet. Frágil para una plantilla que circula (sin conexión, bloqueo
  corporativo de URLs, o caída del servicio = dona rota). Descartada por robustez.
- **Truco de dos gráficos / overlay** para forzar el número al centro: frágil, no recomendado.
- **Mantener barra `SPARKLINE` en Progreso Mensual (sin dona):** rechazado por el usuario; quiere la
  dona de la referencia.

## Colores
Anillo **azul** + resto **gris claro**; barras de Progreso Completado **azules**; encabezados en
marrón (`PALETTE`). Coherente con el resto de la hoja.

## Riesgos / notas de implementación
- El gráfico flotante reintroduce el patrón antes prohibido; se mitiga borrando charts previos en
  cada rebuild y anclando bien la posición sobre AJ–AL.
- Apps Script rechaza opciones de chart `chartArea.bottom`/`chartArea.right` ("no longer supported")
  — no usarlas.
- Los anchos de fila del bloque Progreso Mensual deben dejar espacio para la dona + las celdas de
  número/porcentaje debajo.
