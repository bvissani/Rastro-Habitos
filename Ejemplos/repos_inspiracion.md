# 🎮 Catálogo de Repositorios Clonados — Gamificación de la Vida Real

Todos los repositorios se encuentran en [`Ejemplos/repos/`](./repos), clonados con `--depth 1` y **sin la carpeta `.git`** interna para mantener limpio el repositorio principal de Rastro.
Total: **41 proyectos descargados**. Para volver a clonarlos en cualquier momento: `powershell -ExecutionPolicy Bypass -File Ejemplos\clonar_repos.ps1`

> ⚙️ La carpeta `Ejemplos/` está excluida de `tsconfig.json` y `.claspignore`, y `Ejemplos/repos/` está en `.gitignore`. Por lo tanto, no interfiere con la compilación de Next.js ni con las sincronizaciones de `clasp push`.

**Guía de ejecución local:** 🟢 Directo (abrir archivo HTML o ejecutar `npm install && npm run dev`) · 🟡 Requiere configuración de `.env` o base de datos · 🔴 Entornos pesados (Docker, Android SDK, .NET, etc.)  
**Relevancia para Rastro:** ⭐⭐⭐ Inspiración directa / código reutilizable · ⭐⭐ Buenas ideas de diseño · ⭐ Referencia conceptual

---

## 🏆 Los 8 Proyectos Más Prometedores (Comenzar por aquí)

| # | Repositorio | Motivo principal | Tecnologías | Dificultad |
|---|---|---|---|---|
| 1 | [HabitTrove](./repos/01_rpg_gamificados_web/dohsimpson__HabitTrove) | Sistema completo de **monedas + tienda de recompensas de la vida real** (*Wishlist*). **Mismo stack que Rastro (Next.js + Tailwind)**. | Next.js, Tailwind, Jotai | 🟢 Disponible en puerto 4001 |
| 2 | [ankurrera/SoloLeveling](./repos/02_estilo_solo_leveling_isekai/ankurrera__SoloLeveling) | "Life OS": habilidades reales mapeadas a **atributos RPG con ganancia de XP**. **Utiliza Supabase**. | Vite, React, Supabase | 🟡 |
| 3 | [MattCognac/life-rpg](./repos/01_rpg_gamificados_web/MattCognac__life-rpg) | Cadenas de misiones, árbol de habilidades y rachas. **Next.js + Supabase + Prisma**. | Next.js, Supabase, Prisma | 🟡 |
| 4 | [Vishaldubey2210/Life_RPG_OS](./repos/01_rpg_gamificados_web/Vishaldubey2210__Life_RPG_OS) | Sistema de vida RPG con microanimaciones fluidas (*Framer Motion*). | Next.js, Supabase, Framer Motion | 🟡 |
| 5 | [Myamotto/solo-leveling-habit-tracker](./repos/02_estilo_solo_leveling_isekai/Myamotto__solo-leveling-habit-tracker) | Estética neón de Solo Leveling: **penalizaciones del Sistema, rangos E a S y misiones de ascenso**. | Vite, React, Supabase | 🟡 |
| 6 | [Deratheone/statuswindow](./repos/02_estilo_solo_leveling_isekai/Deratheone__statuswindow) | **Ventana de estado flotante** al estilo manhwa (*The Gamer*). Ideal para el diseño de la interfaz principal. | Next.js, Framer Motion | 🟢 |
| 7 | [yashbhangale/discipline-tracker](./repos/03_google_sheets/yashbhangale__discipline-tracker) | **Gamificación sobre Google Sheets y Google Apps Script**, totalmente alineado a nuestra arquitectura base. | Google Apps Script (`Code.gs`) | 🟢 |
| 8 | [HabitRPG/habitica](./repos/00_referente_habitica/HabitRPG__habitica) | El referente histórico de la industria (más de 14,000 estrellas). Excelente para **estudiar las fórmulas matemáticas de XP, daño y economía**. | Vue.js, Express, MongoDB | 🔴 |

---

## 00 · Referente de la Industria
| Proyecto | Características Destacadas | Tecnologías | Modo de Prueba | Relevancia |
|---|---|---|---|---|
| [HabitRPG/habitica](./repos/00_referente_habitica/HabitRPG__habitica) | Hábitos positivos y negativos, tareas diarias, salud (HP), experiencia (XP), oro, equipamiento, mascotas, misiones en equipo y jefes colaborativos. Revisar `website/common/script/` para fórmulas de daño y balance. | Vue.js, Express, MongoDB | 🔴 `npm run docker:aio` | ⭐⭐⭐ (Lógica y diseño) |

## 01 · Proyectos Web de Gamificación y Rol
| Proyecto | Características Destacadas | Tecnologías | Modo de Prueba | Relevancia |
|---|---|---|---|---|
| [HabitTrove](./repos/01_rpg_gamificados_web/dohsimpson__HabitTrove) | Acumulación de monedas por hábitos y **tienda de recompensas personales** (ej. canjear 50 monedas por un café). | Next.js, Tailwind CSS | 🟢 Corriendo en `localhost:4001` | ⭐⭐⭐ |
| [MattCognac/life-rpg](./repos/01_rpg_gamificados_web/MattCognac__life-rpg) | Conversión de objetivos de vida en misiones secundarias y principales; control de rachas. | Next.js, Supabase, Prisma | 🟡 Requiere `.env.example` | ⭐⭐⭐ |
| [Vishaldubey2210/Life_RPG_OS](./repos/01_rpg_gamificados_web/Vishaldubey2210__Life_RPG_OS) | Panel integral de desarrollo personal con diseño moderno y animaciones. | Next.js, Supabase, Framer Motion | 🟡 Requiere `.env.example` | ⭐⭐⭐ |
| [lifeos-app/lifeos](./repos/01_rpg_gamificados_web/lifeos-app__lifeos) | Sistema operativo de vida: metas, salud, finanzas y **asistente con Inteligencia Artificial**. | Vite, React, Supabase, Electron | 🟡 | ⭐⭐⭐ |
| [alexmita04/Hero-Quest](./repos/01_rpg_gamificados_web/alexmita04__Hero-Quest) | Aplicación interactiva de tareas transformadas en misiones de aventura. | Next.js, Prisma | 🟡 | ⭐⭐ |
| [ajstudd/momentum_ai](./repos/01_rpg_gamificados_web/ajstudd__momentum_ai) | **Generación de misiones diarias mediante Inteligencia Artificial** adaptada al usuario. | Next.js, MongoDB, Framer Motion | 🟡 | ⭐⭐ |
| [Zhang-yd1/daily-quest](./repos/01_rpg_gamificados_web/Zhang-yd1__daily-quest) | Generador aleatorio de misiones cotidianas (recompensa variable pura). | Vite | 🟢 `npm run dev` | ⭐⭐ |
| [PhantomXReborn/IRL_SideQuest_Generator](./repos/01_rpg_gamificados_web/PhantomXReborn__IRL_SideQuest_Generator) | Generador de misiones secundarias para la vida diaria con interfaz inmersiva. | Vite, React, Framer Motion | 🟢 `npm run dev` | ⭐⭐ |
| [Sp1r1tual/questanizer](./repos/01_rpg_gamificados_web/Sp1r1tual__questanizer) | Batallas contra jefes virtuales al completar rutinas y compañero virtual. | Vite, React, Node.js | 🟡 | ⭐⭐ |
| [ARTESHMAN/habit-tracker](./repos/01_rpg_gamificados_web/ARTESHMAN__habit-tracker) | Motor de progresión y estadísticas que funciona completamente en el navegador. | HTML, CSS, JavaScript | 🟢 Abrir `index.html` | ⭐⭐ |
| [Captain-AJ/LIFE.EXE](./repos/01_rpg_gamificados_web/Captain-AJ__LIFE.EXE) | **Sistema de logros al estilo Steam** adaptado a metas de la vida real. | HTML, CSS, JavaScript | 🟢 Abrir `index.html` | ⭐⭐ |
| [coralr-1/earth-online-quest](./repos/01_rpg_gamificados_web/coralr-1__earth-online-quest) | La vida como un juego en línea multijugador masivo (MMO). Ligero y sin dependencias. | HTML, JavaScript | 🟢 Abrir `index.html` | ⭐⭐ |
| [krwg/cultiva](./repos/01_rpg_gamificados_web/krwg__cultiva) | Hábitos que **crecen de semilla a árbol** (gatillo de apego y cuidado). | Vite, Electron | 🟢 `npm run dev` | ⭐⭐ |
| [AndromedaTechnology/habitus](./repos/01_rpg_gamificados_web/AndromedaTechnology__habitus) | Registro de emociones, pensamientos y hábitos con interfaz cuidada. | Vue.js | 🟢 `npm run dev` | ⭐⭐ |
| [jofoerster/habitsync](./repos/01_rpg_gamificados_web/jofoerster__habitsync) | Desafíos y metas compartidas con amigos (gatillo de validación social). | Expo, Java API | 🔴 Requiere Docker | ⭐⭐ |
| [Divyanshkumar62/Skill_Forge](./repos/01_rpg_gamificados_web/Divyanshkumar62__Skill_Forge) | Árbol estructurado de desarrollo de habilidades profesionales y personales. | React, Express, MongoDB | 🟡 | ⭐⭐ |
| [DavidZerox8/TaskMaster](./repos/01_rpg_gamificados_web/DavidZerox8__TaskMaster) | Plataforma de hábitos gamificada con integración de modelos de IA (Claude y Gemini). | Capacitor, Tailwind CSS | 🟡 | ⭐⭐ |
| [zhuyong1297-dev/life-rpg-pwa](./repos/01_rpg_gamificados_web/zhuyong1297-dev__life-rpg-pwa) | Aplicación web progresiva (PWA) de reflexión diaria y retroalimentación inmediata. | Vite, React | 🟢 `npm run dev` | ⭐ |
| [E-Ecstacy/warrior-dashboard](./repos/01_rpg_gamificados_web/E-Ecstacy__warrior-dashboard) | Panel de gamificación enfocado en disciplina física y mental. | Python, Docker | 🔴 | ⭐ |
| [5h4d0wn1k/productivity_game](./repos/01_rpg_gamificados_web/5h4d0wn1k__productivity_game) | Rachas, niveles de experiencia y tabla de clasificación global. | Expo, React Native, Firebase | 🔴 | ⭐ |

## 02 · Estilo Solo Leveling e Isekai ("El Sistema")
| Proyecto | Características Destacadas | Tecnologías | Modo de Prueba | Relevancia |
|---|---|---|---|---|
| [ankurrera/SoloLeveling](./repos/02_estilo_solo_leveling_isekai/ankurrera__SoloLeveling) | Las habilidades del mundo real se convierten en estadísticas activas con XP. | Vite, React, Supabase | 🟡 | ⭐⭐⭐ |
| [Myamotto/solo-leveling-habit-tracker](./repos/02_estilo_solo_leveling_isekai/Myamotto__solo-leveling-habit-tracker) | Penalizaciones por incumplimiento, rangos de cazador (E a S) y pruebas de promoción. | Vite, React, Supabase | 🟡 | ⭐⭐⭐ |
| [Deratheone/statuswindow](./repos/02_estilo_solo_leveling_isekai/Deratheone__statuswindow) | Interfaz gráfica inspirada en ventanas de estado de cómics y novelas ligeras. | Next.js, Framer Motion | 🟢 `npm run dev` | ⭐⭐⭐ |
| [asyhak/Solo-Leveling-Self-Improvement-App](./repos/02_estilo_solo_leveling_isekai/asyhak__Solo-Leveling-Self-Improvement-App) | 5 estadísticas principales, misiones clasificadas por rango y asistencia de IA. | Next.js | 🟢 `npm run dev` | ⭐⭐ |
| [MSrikanthkarthikeyan/aura-quest-grind](./repos/02_estilo_solo_leveling_isekai/MSrikanthkarthikeyan__aura-quest-grind) | Combinación de técnica Pomodoro, seguimiento de hábitos y progreso RPG. | Vite, React, Supabase | 🟡 | ⭐⭐ |
| [dhildeb/vitae-ascend-irl](./repos/02_estilo_solo_leveling_isekai/dhildeb__vitae-ascend-irl) | El usuario es el personaje: seguimiento de estadísticas físicas, mentales y sociales. | Vite, React | 🟢 `npm run dev` | ⭐⭐ |
| [pughal-36/SoloLevelingTest](./repos/02_estilo_solo_leveling_isekai/pughal-36__SoloLevelingTest) | Introducción inmersiva con temática de despertar de cazador. | Vite, React, Supabase | 🟡 | ⭐ |

## 03 · Proyectos Basados en Google Sheets
| Proyecto | Características Destacadas | Tecnologías | Modo de Prueba | Relevancia |
|---|---|---|---|---|
| [yashbhangale/discipline-tracker](./repos/03_google_sheets/yashbhangale__discipline-tracker) | Sistema de disciplina gamificado creado sobre **Google Sheets con automatización en Google Apps Script**. | Google Apps Script (`Code.gs`) | 🟢 Importar a hoja de cálculo | ⭐⭐⭐ |

## 04 · Aplicaciones de Hábitos Convencionales (Referencia de Experiencia de Usuario)
| Proyecto | Aporte Valioso para Rastro | Tecnologías | Modo de Prueba |
|---|---|---|---|
| [iSoron/uhabits](./repos/04_trackers_habitos_referencia_ux/iSoron__uhabits) (Loop, 10,000★) | **Algoritmo de fuerza del hábito**: calcula la constancia ponderada evitando que un solo fallo borre todo el progreso. | Kotlin, Android | 🔴 |
| [daya0576/beaverhabits](./repos/04_trackers_habitos_referencia_ux/daya0576__beaverhabits) | Enfoque minimalista, notas por día y API REST para integraciones externas. | Python, Docker | 🟡 |
| [Vsein/Neohabit](./repos/04_trackers_habitos_referencia_ux/Vsein__Neohabit) | Visualización por mapas de calor y hábitos con frecuencias flexibles (ej. 3 veces cada 7 días). | React, Go | 🔴 |
| [redpangilinan/iotawise](./repos/04_trackers_habitos_referencia_ux/redpangilinan__iotawise) | Registro ágil con mínimo esfuerzo cognitivo y seguimiento de rachas. | Next.js, Prisma | 🟡 |
| [tylxr59/Trakit](./repos/04_trackers_habitos_referencia_ux/tylxr59__Trakit) | Gráfico de aportes estilo GitHub para medir la constancia anual. | SvelteKit | 🟢 |
| [dessalines/habit-maker](./repos/04_trackers_habitos_referencia_ux/dessalines__habit-maker) | Mecánica de recompensas periódicas. | Kotlin, Android | 🔴 |
| [Jinjinov/OpenHabitTracker](./repos/04_trackers_habitos_referencia_ux/Jinjinov__OpenHabitTracker) | Arquitectura multiplataforma para escritorio y web. | C# Blazor | 🔴 |
| [oppiliappan/dijo](./repos/04_trackers_habitos_referencia_ux/oppiliappan__dijo) | Registro rápido por consola de comandos. | Rust | 🔴 |

---

## 05 · Extensiones, Complementos y Otros
- [Ayagikei/LifeUp](./repos/05_plugins_obsidian_y_otros/Ayagikei__LifeUp): Documentación y mecánicas completas de una de las mejores aplicaciones de gamificación (tienda de recompensas, cofres de botín, síntesis de objetos).
- [dromse/obsidian-gamified-tasks](./repos/05_plugins_obsidian_y_otros/dromse__obsidian-gamified-tasks): Asignación de recompensas por etiquetas temáticas.
- [huyhungai/life-rpg-obsidian](./repos/05_plugins_obsidian_y_otros/huyhungai__life-rpg-obsidian): División en 9 áreas de desarrollo personal y asistencia motivacional.
