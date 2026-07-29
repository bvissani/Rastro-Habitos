/**
 * ============================================================================
 *  PLANTILLA RASTREADOR DE HÁBITOS ANIMADO  —  "Hikari Sekai" (réplica)
 *  Google Apps Script para Google Sheets
 * ----------------------------------------------------------------------------
 *  CÓMO USARLO
 *  1) Abrí tu hoja de Google.
 *  2) Menú  Extensiones → Apps Script.
 *  3) Borrá lo que haya y pegá TODO este archivo.
 *  4) Guardá (💾) y ejecutá la función  buildTemplate  (botón ▶ "Ejecutar").
 *  5) Autorizá los permisos que pida (es tu propia cuenta).
 *  6) Volvé a la hoja: van a aparecer las pestañas "Anual Dashboard" y "Enero".
 *
 *  También queda un menú nuevo  "🎯 Rastreador"  para reconstruir cuando quieras.
 *
 *  IMÁGENES: son placeholders libres (emojis Twemoji, licencia CC-BY 4.0).
 *  Para poner los personajes reales de anime, editá las URLs en la pestaña
 *  oculta "Config" (tabla "PERSONAJES"). No hace falta tocar el código.
 *
 *  ⚠️ Este script CREA o SOBRESCRIBE las pestañas: Anual Dashboard, Enero y Config.
 * ============================================================================
 */

/* ------------------------------- CONFIG ---------------------------------- */

// Paleta extraída de las imágenes de referencia.
var PALETTE = {
  maroon:   '#9E1B32', // rojo/granate principal (headers)
  maroonDk: '#7E1428',
  green:    '#1E7A46', // verde del selector
  text:     '#333333',
  light:    '#FBF7F7',
  grayHdr:  '#F1E9EA',
  white:    '#FFFFFF',
  // acentos por semana (semana 1..5)
  week: ['#4A90D9', '#E08A3C', '#C0392B', '#8E1B2E', '#8B6B3E'],
  weekSoft: ['#DCEBF8', '#F8E7D5', '#F5DAD6', '#EBD3D7', '#EAE0D2']
};

// Lista de hábitos por defecto (editable luego en la hoja Enero, columna A).
var HABITS = [
  'Despertarse temprano',
  'Ejercicio / Gimnasio',
  'Meditar',
  'Leer 20 min',
  'Beber 2L de agua',
  'Estudiar / Aprender',
  'Controlar gastos',
  'Dieta saludable',
  'Dormir 8 horas',
  'Planificar el día'
];

// Personajes: [nombre, emojiGrande, [emoji etapa1..6]].
// Los emojis son sólo PLACEHOLDERS visibles para comprobar la mecánica.
// Reemplazá las URLs en Config!PERSONAJES por tus imágenes reales.
var CHARACTERS = [
  ['Goku',           '1f9d1-200d-1f680', ['1f95a','1f423','1f424','1f425','1f985','1f409']],
  // Naruto con arte REAL (jsDelivr, repo fijado a commit para URLs estables).
  // 6 etapas = progresión de poder: base → decidido → jutsu → Modo Sabio →
  // Manto de Kurama → Modo Sabio de los Seis Caminos.
  ['Naruto',
    'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/adi%20image/Naruto-Uzumaki-No-Background.png',
    [
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/adi%20image/naruto.png',
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/images/naruto%203.png',
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/adi%20image/Naruto-Uzumaki-No-Background.png',
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/Images/naruto.png',
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/Images/naruto_ai.jpg',
      'https://cdn.jsdelivr.net/gh/vikhyatsingh123/Naruto-Shippuden@09c52b15b1a3d87a27c323eec8e9baa49e0ff8b4/Images/naruto-six-paths-sage.png'
    ]],
  ['Luffy',          '1f451',            ['1f95a','1f423','1f424','1f425','1f406','1f409']],
  ['Izuku',          '1f7e9',            ['1f95a','1f423','1f424','1f425','1f438','1f409']],
  ['Levi',           '2694',             ['1f95a','1f423','1f424','1f425','1f5e1','2694']],
  ['Toji',           '1f5e1',            ['1f95a','1f423','1f424','1f425','1f5e1','2694']],
  ['Gojo Satoru',    '1f441',            ['1f95a','1f423','1f424','1f425','1f440','1f441']],
  ['Itachi Uchiha',  '1f985',            ['1f95a','1f423','1f424','1f425','1f426','1f985']],
  ['Kakashi',        '26a1',             ['1f95a','1f423','1f424','1f425','26a1','1f329']],
  ['Sasuke',         '1f409',            ['1f95a','1f423','1f424','1f425','1f406','1f409']],
  ['Vegeta',         '1f451',            ['1f95a','1f423','1f424','1f425','1f985','1f409']],
  ['Eren Yeager',    '1f9cc',            ['1f95a','1f423','1f424','1f425','1f98d','1f9cc']],
  ['Killua Zoldyck', '26a1',             ['1f95a','1f423','1f424','1f425','26a1','1f329']]
];

// Umbrales de evolución (los % de cada etapa). 6 etapas.
var EVO_THRESHOLDS = [0, 0.20, 0.40, 0.60, 0.80, 1.00];

// Base del CDN de emojis (Twemoji). Devuelve una PNG por code-point.
function twemojiUrl(code) {
  return 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.0.3/assets/72x72/' + code + '.png';
}

// Resuelve una entrada de imagen: si ya es una URL http(s) la usa tal cual;
// si no, la trata como código Twemoji (placeholder). Así un personaje puede
// mezclar arte real (URLs) con emojis de relleno.
function imgUrl(s) {
  return /^https?:\/\//i.test(s) ? s : twemojiUrl(s);
}

// Geometría de la hoja de mes (Enero) — diseño LATERAL.
//   Cols A-C  = panel izquierdo (mes, hábitos, Resumen General, Progreso Semanal)
//   Cols D-AH = los 31 días (gráfico verde, avatares, semanas, checkboxes, ...)
//   Col  AI   = separador libre
//   Cols AJ-AL= panel derecho (Hábitos completados, imagen, Progreso Completado/Mensual)
var G = {
  FIRST_DAY_COL: 4,   // D
  DAYS: 31,
  TREND_ROWS: [1, 5], // banda superior (gráfico de tendencia)
  PCT_ROW: 6,
  AVATAR_ROW: 7,
  WEEK_ROW: 8,
  DAYNUM_ROW: 9,
  WEEKDAY_ROW: 10,
  HABIT_START: 11,
  // Semanas: [colInicio, colFin] (7,7,7,7,3 = 31 días), empezando en D(4)
  WEEKS: [[4, 10], [11, 17], [18, 24], [25, 31], [32, 34]]
};
G.HABIT_END = G.HABIT_START + HABITS.length - 1;  // 11 + 10 - 1 = 20
G.TOTAL_ROW = G.HABIT_END + 1;                     // 21
G.LAST_DAY_COL = G.FIRST_DAY_COL + G.DAYS - 1;     // 34 (AH)
// Panel derecho
G.SPACER_COL = 35;  // AI
G.RIGHT_COL = 36;   // AJ (AJ-AL = 36-38)

// Día de la semana DINÁMICO por año. Se calcula in-cell con el named range ANIO
// (celda "Escribe el año" del Anual Dashboard): el usuario cambia el año y se
// recalculan solas todas las etiquetas jue/vie/sáb… sin reconstruir.
// weekdayFormula_(mes, dia) -> etiqueta corta (dom..sáb) de esa fecha.
// WEEKDAY() por defecto: dom=1, lun=2, … sáb=7.
function weekdayFormula_(mes, dia) {
  return '=CHOOSE(WEEKDAY(DATE(ANIO,' + mes + ',' + dia + ')),' +
    '"dom","lun","mar","mié","jue","vie","sáb")';
}

/* ------------------------------ HELPERS ---------------------------------- */

function colLetter(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}
function a1(row, col) { return colLetter(col) + row; }

// Recrea la hoja DESDE CERO (borra la vieja y crea una nueva).
// Es la forma 100% idempotente: clear() no quita merges, validaciones de datos
// (checkboxes), congelados ni reglas condicionales de builds anteriores, y eso
// generaba colisiones de merge y "infringe la norma de validación".
function getOrCreateSheet(ss, name) {
  var old = ss.getSheetByName(name);
  var sh = ss.insertSheet();          // hoja nueva, nombre temporal
  if (old) ss.deleteSheet(old);       // borra la vieja (con todo su estado)
  sh.setName(name);                   // ya sin colisión de nombre
  return sh;
}
function clearCharts_(sh) { sh.getCharts().forEach(function (c) { sh.removeChart(c); }); }

// Asegura que la hoja tenga al menos `cols` columnas y `rows` filas
// (una hoja nueva trae 26 columnas / 1000 filas y da "out of bounds" al pasarse).
function ensureGrid_(sh, rows, cols) {
  var maxC = sh.getMaxColumns();
  if (cols > maxC) sh.insertColumnsAfter(maxC, cols - maxC);
  var maxR = sh.getMaxRows();
  if (rows > maxR) sh.insertRowsAfter(maxR, rows - maxR);
}
function clearImages_(sh) {
  if (sh.getImages) { sh.getImages().forEach(function (im) { im.remove(); }); }
}

/* ------------------------------- MENU ------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎯 Rastreador')
    .addItem('🔧 Construir / Reconstruir plantilla', 'buildTemplate')
    .addToUi();
}

/* --------------------------- ORQUESTADOR --------------------------------- */

function buildTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var config = getOrCreateSheet(ss, 'Config');
  var dash   = getOrCreateSheet(ss, 'Anual Dashboard');
  var enero  = getOrCreateSheet(ss, 'Enero');

  buildConfigSheet(ss, config);
  buildAnualDashboard(ss, dash);
  buildMonthSheet(ss, enero);

  // Orden de pestañas: Dashboard, Enero, (Config al final oculta).
  ss.setActiveSheet(dash); ss.moveActiveSheet(1);
  ss.setActiveSheet(enero); ss.moveActiveSheet(2);
  config.hideSheet();

  ss.setActiveSheet(dash);
  SpreadsheetApp.getActiveSpreadsheet().toast('Plantilla construida ✅', 'Rastreador', 5);
}

/* --------------------------- CONFIG SHEET -------------------------------- */

function buildConfigSheet(ss, sh) {
  sh.setHiddenGridlines(false);

  // --- Tabla PERSONAJES: A1:H(n+1) ---
  // A: nombre | B: imagen grande | C..H: etapas 1..6
  var header = ['Personaje', 'Imagen grande', 'Etapa 1 (0%)', 'Etapa 2 (20%)',
    'Etapa 3 (40%)', 'Etapa 4 (60%)', 'Etapa 5 (80%)', 'Etapa 6 (100%)'];
  sh.getRange(1, 1, 1, header.length).setValues([header])
    .setFontWeight('bold').setBackground(PALETTE.maroon).setFontColor('#FFF');

  var rows = CHARACTERS.map(function (c) {
    var big = imgUrl(c[1]);
    var etapas = c[2].map(function (e) { return imgUrl(e); });
    return [c[0], big].concat(etapas);
  });
  sh.getRange(2, 1, rows.length, 8).setValues(rows);
  var charLast = 1 + rows.length; // fila última de personajes

  // --- Umbrales de evolución (J1:K7) ---
  sh.getRange(1, 10).setValue('Etapa').setFontWeight('bold');
  sh.getRange(1, 11).setValue('Umbral %').setFontWeight('bold');
  for (var i = 0; i < EVO_THRESHOLDS.length; i++) {
    sh.getRange(2 + i, 10).setValue(i + 1);
    sh.getRange(2 + i, 11).setValue(EVO_THRESHOLDS[i]);
  }

  // --- Notas ---
  sh.getRange(11, 10).setValue(
    'Reemplazá las URLs de la tabla PERSONAJES (B..H) por tus imágenes reales. ' +
    'Deben ser enlaces directos a la imagen (terminados en .png/.jpg).')
    .setFontStyle('italic').setWrap(true);
  sh.getRange(11, 10, 3, 4).merge();

  // --- Named ranges ---
  ss.setNamedRange('CHAR_TABLE', sh.getRange(2, 1, rows.length, 8)); // A2:H14
  ss.setNamedRange('CHAR_NAMES', sh.getRange(2, 1, rows.length, 1)); // A2:A14

  sh.setColumnWidth(1, 140);
  for (var c = 2; c <= 8; c++) sh.setColumnWidth(c, 230);
}

/* ------------------------- ANUAL DASHBOARD ------------------------------- */

function buildAnualDashboard(ss, sh) {
  sh.setHiddenGridlines(true);

  // Anchos base.
  sh.setColumnWidth(1, 30);
  sh.setColumnWidths(2, 4, 90);
  sh.setColumnWidth(7, 20);
  sh.setColumnWidths(8, 3, 90);

  // --- Título / año ---
  sh.getRange('B2:C2').merge().setValue('HIKARI SEKAI')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(14);
  sh.getRange('B3').setValue('Escribe el año:').setFontColor(PALETTE.text);
  sh.getRange('C3').setValue(2026).setFontWeight('bold').setFontColor(PALETTE.maroon)
    .setHorizontalAlignment('center');
  ss.setNamedRange('ANIO', sh.getRange('C3'));

  // --- Bloque "Elige tu personaje:" ---
  sh.getRange('B5:E5').merge().setValue('Elige tu personaje:')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(12);

  var selCell = sh.getRange('B6');
  sh.getRange('B6:E6').merge();
  selCell.setValue(CHARACTERS[0][0]) // Goku por defecto
    .setBackground(PALETTE.green).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(12);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRangeByName('CHAR_NAMES'), true)
    .setAllowInvalid(false).build();
  selCell.setDataValidation(rule);

  // Named range del personaje seleccionado (usado en toda la plantilla).
  ss.setNamedRange('PERSONAJE', selCell);

  // --- Imagen grande del personaje (cambia con el dropdown) ---
  sh.getRange('B7:E20').merge()
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  // Evoluciona con el % ANUAL (promedio de los 12 meses), no con una imagen fija.
  sh.getRange('B7').setFormula(
    '=IFERROR(IMAGE(INDEX(CHAR_TABLE,MATCH(PERSONAJE,CHAR_NAMES,0),' +
    '3+MIN(5,FLOOR(AVERAGE($J$4:$J$15)/0.2))),1),"")');
  for (var r = 7; r <= 20; r++) sh.setRowHeight(r, 26);

  // Borde del recuadro de imagen.
  sh.getRange('B5:E20').setBorder(true, true, true, true, false, false,
    PALETTE.maroon, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  // --- Resumen anual (12 meses) ---
  sh.getRange('H2:J2').merge().setValue('Resumen anual')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center');
  sh.getRange('H3:J3').setValues([['Mes', 'Completado', '%']])
    .setFontWeight('bold').setBackground(PALETTE.grayHdr);

  var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
    'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  for (var m = 0; m < 12; m++) {
    var row = 4 + m;
    sh.getRange(row, 8).setValue(meses[m]);
    if (meses[m] === 'Enero') {
      // Lee las celdas técnicas de la hoja Enero (AN2=completado, AN4=%).
      sh.getRange(row, 9).setFormula("=IFERROR(Enero!$AN$2,0)");
      sh.getRange(row, 10).setFormula("=IFERROR(Enero!$AN$4,0)").setNumberFormat('0%');
    } else {
      sh.getRange(row, 9).setValue(0);
      sh.getRange(row, 10).setValue(0).setNumberFormat('0%');
    }
  }
  sh.getRange('H3:J15').setBorder(true, true, true, true, true, true,
    '#CCC', SpreadsheetApp.BorderStyle.SOLID);

  sh.getRange('B22').setValue('Consejo: elegí tu personaje arriba; controla las imágenes en la hoja Enero.')
    .setFontStyle('italic').setFontColor('#888');

  sh.setFrozenRows(1);
}

/* --------------------------- HOJA DE MES --------------------------------- */

function buildMonthSheet(ss, sh) {
  sh.setHiddenGridlines(true);

  var FD = G.FIRST_DAY_COL, LD = G.LAST_DAY_COL;

  // Columnas hasta AU(47, tabla auxiliar del Resumen); filas hasta 50.
  ensureGrid_(sh, 50, 48);

  /* ---- Anchos y altos ---- */
  sh.setColumnWidth(1, 118);                                  // A
  sh.setColumnWidth(2, 60);                                   // B
  sh.setColumnWidth(3, 38);                                   // C (N.º)
  for (var c = FD; c <= LD; c++) sh.setColumnWidth(c, 26);    // D-AH días
  sh.setColumnWidth(G.SPACER_COL, 16);                        // AI separador
  sh.setColumnWidths(G.RIGHT_COL, 3, 96);                     // AJ-AL panel derecho
  sh.setRowHeight(G.AVATAR_ROW, 42);

  /* ---- Caja de mes + logo (A1:C5) ---- */
  sh.getRange(1, 1, 5, 3).merge()
    .setFormula('=ANIO&CHAR(10)&"ENERO"&CHAR(10)&"★ Hikari Sekai"') // año dinámico
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setFontSize(14).setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);

  /* ---- Fila % diario (D-AH) ---- */
  sh.getRange(G.PCT_ROW, 1, 1, 3).merge().setValue('% diario')
    .setBackground(PALETTE.maroonDk).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(9);
  for (var d = 1; d <= G.DAYS; d++) {
    var col = FD + d - 1;
    sh.getRange(G.PCT_ROW, col)
      .setFormula('=IFERROR(' + a1(G.TOTAL_ROW, col) + '/NUM_HABITOS,0)')
      .setNumberFormat('0%').setFontSize(6).setHorizontalAlignment('center');
  }

  /* ---- Fila de avatares evolutivos (D-AH) ---- */
  sh.getRange(G.AVATAR_ROW, 1, 1, 3).merge().setValue('Evolución')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(9);
  for (var d2 = 1; d2 <= G.DAYS; d2++) {
    var col2 = FD + d2 - 1;
    var pctCell = a1(G.PCT_ROW, col2);
    sh.getRange(G.AVATAR_ROW, col2).setFormula(
      '=IFERROR(IMAGE(INDEX(CHAR_TABLE,MATCH(PERSONAJE,CHAR_NAMES,0),' +
      '3+MIN(5,FLOOR(' + pctCell + '/0.2)))),"")')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
  }

  /* ---- Cabecera hábitos (A8:B10 título, C8:C10 N.º) ---- */
  sh.getRange(G.WEEK_ROW, 1, 3, 2).merge()
    .setValue('Seguimiento de Hábitos')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true).setFontSize(9);
  sh.getRange(G.WEEK_ROW, 3, 3, 1).merge()
    .setValue('N.º')
    .setBackground(PALETTE.maroonDk).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(8);

  /* ---- Cabecera de semanas (D-AH, fila 8) ---- */
  for (var w = 0; w < G.WEEKS.length; w++) {
    var s = G.WEEKS[w][0], e = G.WEEKS[w][1];
    sh.getRange(G.WEEK_ROW, s, 1, e - s + 1).merge()
      .setValue('semana ' + (w + 1))
      .setBackground(PALETTE.week[w]).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(8);
  }

  /* ---- Nº de día y día de semana ---- */
  for (var d3 = 1; d3 <= G.DAYS; d3++) {
    var col3 = FD + d3 - 1;
    var wk = weekIndexForDay_(d3);
    sh.getRange(G.DAYNUM_ROW, col3).setValue(d3)
      .setBackground(PALETTE.week[wk]).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(7);
    sh.getRange(G.WEEKDAY_ROW, col3).setFormula(weekdayFormula_(1, d3))
      .setBackground(PALETTE.weekSoft[wk]).setFontColor(PALETTE.text)
      .setHorizontalAlignment('center').setFontSize(6);
  }

  /* ---- Hábitos (A:B nombre, C conteo) + checkboxes (D-AH) ---- */
  for (var h = 0; h < HABITS.length; h++) {
    var row = G.HABIT_START + h;
    sh.getRange(row, 1, 1, 2).merge().setValue(HABITS[h]).setFontSize(9)
      .setVerticalAlignment('middle')
      .setBackground(h % 2 ? PALETTE.light : PALETTE.white);
    sh.getRange(row, 3).setFormula(
      '=COUNTIF(' + a1(row, FD) + ':' + a1(row, LD) + ',TRUE)')
      .setHorizontalAlignment('center').setFontSize(8).setFontColor(PALETTE.maroon)
      .setFontWeight('bold');
  }
  var grid = sh.getRange(G.HABIT_START, FD, HABITS.length, G.DAYS);
  grid.insertCheckboxes();
  grid.setHorizontalAlignment('center');
  // Fondo SUAVE del color de su semana en toda la columna de checkboxes.
  // (La celda MARCADA se pinta con el color sólido de la semana por formato
  //  condicional en applyWeekConditionalFormatting_, que tiene prioridad.)
  for (var dc = 1; dc <= G.DAYS; dc++) {
    var cCol = FD + dc - 1, wkC = weekIndexForDay_(dc);
    sh.getRange(G.HABIT_START, cCol, HABITS.length, 1).setBackground(PALETTE.weekSoft[wkC]);
  }

  /* ---- Fila Total por día (A21:C21 + D-AH) ---- */
  sh.getRange(G.TOTAL_ROW, 1, 1, 3).merge().setValue('Total / día')
    .setBackground(PALETTE.maroonDk).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(9);
  for (var d4 = 1; d4 <= G.DAYS; d4++) {
    var col4 = FD + d4 - 1;
    sh.getRange(G.TOTAL_ROW, col4).setFormula(
      '=COUNTIF(' + a1(G.HABIT_START, col4) + ':' + a1(G.HABIT_END, col4) + ',TRUE)')
      .setHorizontalAlignment('center').setFontSize(7);
  }

  /* ---- Bordes de la grilla (fila 8 a 21, cols A-AH) ---- */
  sh.getRange(G.WEEK_ROW, 1, G.TOTAL_ROW - G.WEEK_ROW + 1, LD)
    .setBorder(true, true, true, true, true, true, '#DDD', SpreadsheetApp.BorderStyle.SOLID);

  applyWeekConditionalFormatting_(sh);
  buildProgressPanels_(ss, sh);
  buildTrendChart_(sh);

  /* ---- Congelar SOLO el panel izquierdo (A-C) ---- */
  // NO congelamos filas: el gráfico de tendencia flotante va en la banda D1:AH5,
  // y un chart flotante anclado dentro de filas congeladas se rompe / se corre
  // debajo del divisor. Sin congelado de filas, el chart se ancla bien arriba.
  sh.setFrozenColumns(3);          // A-C
}

function weekIndexForDay_(day) {
  var col = G.FIRST_DAY_COL + day - 1;
  for (var w = 0; w < G.WEEKS.length; w++) {
    if (col >= G.WEEKS[w][0] && col <= G.WEEKS[w][1]) return w;
  }
  return 0;
}

function applyWeekConditionalFormatting_(sh) {
  var rules = []; // empezar limpio (no acumular reglas de corridas previas)

  // 1) Checkboxes marcados: fondo del color de su semana.
  for (var w = 0; w < G.WEEKS.length; w++) {
    var s = G.WEEKS[w][0], e = G.WEEKS[w][1];
    var rng = sh.getRange(G.HABIT_START, s, HABITS.length, e - s + 1);
    var firstCell = a1(G.HABIT_START, s);
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=' + firstCell + '=TRUE')
      .setBackground(PALETTE.week[w])
      .setRanges([rng]).build());
  }

  // 2) Tendencia (banda D1:AH5): relleno verde de abajo (fila 5) hacia arriba
  //    (fila 1) según el % diario de cada columna (celda de la fila PCT_ROW).
  //    Fila 5 se pinta con >0, fila 4 con >0.2, ... fila 1 con >0.8.
  var thresholds = [0, 0.2, 0.4, 0.6, 0.8]; // fila 5,4,3,2,1
  var pctColLetter = colLetter(G.FIRST_DAY_COL); // 'D' (ref relativa a la columna)
  for (var t = 0; t < thresholds.length; t++) {
    var bandRow = G.PCT_ROW - 1 - t; // 5,4,3,2,1
    var bandRng = sh.getRange(bandRow, G.FIRST_DAY_COL, 1, G.DAYS);
    var f = '=' + pctColLetter + '$' + G.PCT_ROW + '>' + thresholds[t];
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(f).setBackground('#43A047')
      .setRanges([bandRng]).build());
  }

  sh.setConditionalFormatRules(rules);
}

/* -------------------- PANELES DE PROGRESO + GRÁFICOS ---------------------- */

function buildProgressPanels_(ss, sh) {
  var FD = G.FIRST_DAY_COL, LD = G.LAST_DAY_COL, RC = G.RIGHT_COL;
  var NHAB = HABITS.length;
  var totRange = a1(G.TOTAL_ROW, FD) + ':' + a1(G.TOTAL_ROW, LD); // D21:AH21
  var pctRange = a1(G.PCT_ROW, FD) + ':' + a1(G.PCT_ROW, LD);     // D6:AH6
  var MC = 40; // columna técnica AN (celdas de cálculo, texto blanco)

  // ---- Celdas técnicas (col AN) ----
  sh.getRange(1, MC).setFormula(
    '=COUNTA(' + a1(G.HABIT_START, 1) + ':' + a1(G.HABIT_END, 1) + ')'); // AN1 = NUM_HABITOS
  ss.setNamedRange('NUM_HABITOS', sh.getRange(1, MC));
  sh.getRange(2, MC).setFormula('=SUM(' + totRange + ')');            // AN2 completado
  sh.getRange(3, MC).setFormula('=NUM_HABITOS*' + G.DAYS);            // AN3 total posible
  sh.getRange(4, MC).setFormula(
    '=IFERROR(' + a1(2, MC) + '/' + a1(3, MC) + ',0)');               // AN4 %
  sh.getRange(1, MC, 4, 1).setFontColor('#FFFFFF').setFontSize(8);    // "ocultar"

  /* ===== TENDENCIA (% diario) — banda D1:AH5 ===== */
  // El relleno verde se pinta con formato condicional (de abajo hacia arriba
  // según el % de cada día) en applyWeekConditionalFormatting_. Acá solo dejamos
  // la banda con las celdas vacías (se colorean solas al marcar).

  /* ===== HÁBITOS COMPLETADOS + imagen del personaje (arriba derecha AJ-AL) ===== */
  // El box (nº + imagen) queda en filas 2-10 para NO cruzar el congelado (fila 10).
  sh.getRange(1, RC, 1, 3).merge().setValue('Hábitos completados')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(10);
  sh.getRange(2, RC, 2, 3).merge().setFormula('=SUM(' + totRange + ')')
    .setFontSize(24).setFontWeight('bold').setFontColor(PALETTE.maroon)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  // Imagen grande: evoluciona con el % MENSUAL (AN4), representa el "nivel general" del mes.
  sh.getRange(4, RC, 7, 3).merge()
    .setFormula('=IFERROR(IMAGE(INDEX(CHAR_TABLE,MATCH(PERSONAJE,CHAR_NAMES,0),' +
      '3+MIN(5,FLOOR(' + a1(4, MC) + '/0.2))),1),"")')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.getRange(2, RC, 9, 3)
    .setBorder(true, true, true, true, false, false, PALETTE.maroon, SpreadsheetApp.BorderStyle.SOLID);

  /* ===== PROGRESO COMPLETADO (derecha, barra in-cell ancha AJ:AK + % en AL) ===== */
  var pcHdr = 11;
  sh.getRange(pcHdr, RC, 1, 3).merge().setValue('Progreso Completado')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setFontSize(10);
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
    .setOption('width', 265)                     // grande: ocupa el alto del segmento Resumen General
    .setOption('height', 265)
    .setPosition(pmRow + 1, RC, 11, 2)           // ancla fila 24, col AJ; offset para centrar
    .build();
  sh.insertChart(donut);

  // Número (completado/total) y % centrados DEBAJO del anillo, al fondo del segmento (filas 38-39).
  sh.getRange(pmRow + 15, RC, 1, 3).merge()     // fila 38
    .setFormula('=' + a1(2, MC) + '&"/"&' + a1(3, MC))
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(16)
    .setFontWeight('bold').setFontColor(PALETTE.maroon);
  sh.getRange(pmRow + 16, RC, 1, 3).merge()     // fila 39
    .setFormula('=' + a1(4, MC))
    .setNumberFormat('0%').setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setFontSize(20).setFontWeight('bold').setFontColor(PALETTE.week[0]);

  /* ===== RESUMEN GENERAL (abajo: cabeceras + barras sólidas por día + tabla) ===== */
  var rgHdr = 23, rgDay = 24, rgWd = 25, rgBar = 26, rgBarH = 8;
  var rgComp = 34, rgObj = 35, rgPend = 36, psTot = 37, psPct = 38, psBar = 39;

  // Título (izq) + imagen del personaje debajo.
  sh.getRange(rgHdr, 1, 3, 3).merge()
    .setValue('Resumen General\nPlantilla oficial de Hikari Sekai')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true).setFontSize(9);
  sh.getRange(rgBar, 1, rgBarH, 3).merge()
    .setFormula('=IFERROR(IMAGE(INDEX(CHAR_TABLE,MATCH(PERSONAJE,CHAR_NAMES,0),' +
      '3+MIN(5,FLOOR(' + a1(4, MC) + '/0.2))),1),"")')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, false, false, PALETTE.maroon, SpreadsheetApp.BorderStyle.SOLID);

  // Cabeceras de semana (fila rgHdr, D-AH).
  for (var w = 0; w < G.WEEKS.length; w++) {
    var s = G.WEEKS[w][0], e = G.WEEKS[w][1];
    sh.getRange(rgHdr, s, 1, e - s + 1).merge().setValue('semana ' + (w + 1))
      .setBackground(PALETTE.week[w]).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(8);
  }

  // Por día: nº de día, día de semana y barra sólida (SPARKLINE por celda, color de la semana).
  for (var d = 1; d <= G.DAYS; d++) {
    var col = FD + d - 1, wk = weekIndexForDay_(d), totCell = a1(G.TOTAL_ROW, col);
    sh.getRange(rgDay, col).setValue(d)
      .setBackground(PALETTE.week[wk]).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(7);
    sh.getRange(rgWd, col).setFormula(weekdayFormula_(1, d))
      .setBackground(PALETTE.weekSoft[wk]).setFontColor(PALETTE.text)
      .setHorizontalAlignment('center').setFontSize(6);
    sh.getRange(rgBar, col, rgBarH, 1).merge();
    sh.getRange(rgBar, col).setFormula(
      '=SPARKLINE(' + totCell + ',{"charttype","column";"ymin",0;"ymax",' + NHAB +
      ';"color","' + PALETTE.week[wk] + '"})');
  }

  // Tabla Completado / Objetivo / Pendiente por día.
  var rgLabels = [[rgComp, 'Completado'], [rgObj, 'Objetivo'], [rgPend, 'Pendiente']];
  for (var li = 0; li < rgLabels.length; li++) {
    sh.getRange(rgLabels[li][0], 1, 1, 3).merge().setValue(rgLabels[li][1])
      .setBackground(PALETTE.maroonDk).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(8);
  }
  for (var d2 = 1; d2 <= G.DAYS; d2++) {
    var col2 = FD + d2 - 1, wk2 = weekIndexForDay_(d2);
    sh.getRange(rgComp, col2).setFormula('=' + a1(G.TOTAL_ROW, col2))
      .setBackground(PALETTE.weekSoft[wk2]).setHorizontalAlignment('center').setFontSize(7);
    sh.getRange(rgObj, col2).setFormula('=NUM_HABITOS')
      .setBackground(PALETTE.weekSoft[wk2]).setHorizontalAlignment('center').setFontSize(7);
    sh.getRange(rgPend, col2).setFormula('=' + a1(rgObj, col2) + '-' + a1(rgComp, col2))
      .setBackground(PALETTE.weekSoft[wk2]).setHorizontalAlignment('center').setFontSize(7);
  }

  // Progreso Semanal: 3 filas por semana — X/Y (completados/total), % y barra horizontal.
  sh.getRange(psTot, 1, 3, 3).merge().setValue('Progreso Semanal')
    .setBackground(PALETTE.maroon).setFontColor('#FFF').setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setFontSize(9);
  for (var w3 = 0; w3 < G.WEEKS.length; w3++) {
    var s3 = G.WEEKS[w3][0], e3 = G.WEEKS[w3][1], dias3 = e3 - s3 + 1;
    var compSum = 'SUM(' + a1(rgComp, s3) + ':' + a1(rgComp, e3) + ')';
    var objW = 'NUM_HABITOS*' + dias3;
    sh.getRange(psTot, s3, 1, e3 - s3 + 1).merge()
      .setFormula('=' + compSum + '&"/"&(' + objW + ')')
      .setBackground(PALETTE.week[w3]).setFontColor('#FFF').setFontWeight('bold')
      .setHorizontalAlignment('center').setFontSize(9);
    sh.getRange(psPct, s3, 1, e3 - s3 + 1).merge()
      .setFormula('=IFERROR(' + compSum + '/(' + objW + '),0)')
      .setNumberFormat('0%').setHorizontalAlignment('center').setFontSize(9)
      .setFontWeight('bold').setFontColor(PALETTE.maroon);
    // Barra de progreso horizontal (lee la celda de % de la semana, max = 1).
    sh.getRange(psBar, s3, 1, e3 - s3 + 1).merge()
      .setFormula('=SPARKLINE(' + a1(psPct, s3) +
        ',{"charttype","bar";"max",1;"color1","' + PALETTE.week[w3] + '"})');
  }

  // Bordes de la tabla del Resumen (D-AH, filas rgHdr..psBar).
  sh.getRange(rgHdr, FD, psBar - rgHdr + 1, G.DAYS)
    .setBorder(true, true, true, true, true, true, '#DDD', SpreadsheetApp.BorderStyle.SOLID);
}

/* ---- Gráfico de tendencia (área verde suave del % diario), banda D1:AH5 ---- */
// Único además de la dona: un gráfico flotante de ÁREA sobre la banda superior.
// Se alimenta de una tabla vertical oculta (día, % diario) en cols AP:AQ.
// El relleno condicional escalonado queda debajo como respaldo visual.
function buildTrendChart_(sh) {
  var FD = G.FIRST_DAY_COL;
  var HP = 42; // AP = día (eje X), AQ(43) = % diario (serie)

  for (var d = 1; d <= G.DAYS; d++) {
    var col = FD + d - 1;
    sh.getRange(d, HP).setValue(d);                                // AP: nº de día
    sh.getRange(d, HP + 1).setFormula('=' + a1(G.PCT_ROW, col));   // AQ: % de ese día
  }
  sh.getRange(1, HP, G.DAYS, 2).setFontColor('#FFFFFF').setFontSize(8); // ocultar datos

  var area = sh.newChart()
    .setChartType(Charts.ChartType.AREA)
    .addRange(sh.getRange(1, HP, G.DAYS, 2))       // AP1:AQ31 (día, %)
    .setNumHeaders(0)
    .setOption('legend', 'none')
    .setOption('title', '')
    .setOption('colors', [PALETTE.green])
    .setOption('areaOpacity', 0.4)
    .setOption('lineWidth', 2)
    .setOption('curveType', 'function')            // curva suave (como la referencia)
    .setOption('pointSize', 0)
    .setOption('hAxis', { textPosition: 'none', gridlines: { color: '#FFFFFF' } })
    .setOption('vAxis', { textPosition: 'none', gridlines: { color: '#FFFFFF' }, viewWindow: { min: 0, max: 1 } })
    // NO usar chartArea: en Apps Script deja el gráfico vacío. Para cubrir hasta AH/AI,
    // ensanchamos el gráfico (el margen der. fijo empuja el área de dibujo hacia AI).
    .setOption('width', 848)                        // 31 días (806px) + margen para llegar a AI
    .setOption('height', 110)                       // ~ filas 1-5
    .setPosition(1, FD, 0, 0)                       // ancla D1
    .build();
  sh.insertChart(area);
}
