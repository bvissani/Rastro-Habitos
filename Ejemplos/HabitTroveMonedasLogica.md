# 🪙 Lógica del Sistema de Monedas y Lista de Deseos (HabitTrove)

Documento de extracción y análisis de la arquitectura económica de **HabitTrove**. Explica en detalle cómo se ganan, auditan y canjean monedas por recompensas de la vida real, y cómo adaptar este sistema a **Rastro**.

---

## 1. Arquitectura General del Sistema Económico

El sistema funciona bajo un esquema de **economía virtual con respaldo en la vida real**:
1. **Generación de Monedas (Ingresos):** Cumplir hábitos o tareas otorga una cantidad fija de monedas (`coinReward`).
2. **Registro Contable (Ledger / Historial):** Cada movimiento genera una transacción inmutable con marca de tiempo (`timestamp`), tipo de evento, monto positivo o negativo, e identificador del elemento relacionado.
3. **Canje de Recompensas (Gastos):** El usuario crea elementos en su lista de deseos (*Wishlist*) con un costo en monedas (`coinCost`) y un enlace web opcional (`link`) hacia el producto o actividad en la vida real.
4. **Protección y Reversibilidad:** Desmarcar un hábito completado descuenta automáticamente las monedas otorgadas mediante una transacción de reversión (`UNDO`).

---

## 2. Modelos de Datos

### 2.1 Modelo de Hábito / Tarea (`Habit`)
```typescript
export type Habit = {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  coinReward: number;           // Cantidad de monedas que otorga al completarse
  targetCompletions?: number;   // Veces requeridas en el período (por defecto 1)
  completions: string[];        // Registro de fechas/horas en que se marcó
  isTask?: boolean;             // true = tarea única / false = hábito recurrente
  archived?: boolean;
};
```

### 2.2 Modelo de Recompensa / Lista de Deseos (`WishlistItemType`)
```typescript
export type WishlistItemType = {
  id: string;
  name: string;                 // Nombre de la recompensa (ej. "Cena especial", "Juego en Steam")
  description: string;
  coinCost: number;             // Costo en monedas requerido para canjear
  link?: string;                // Enlace web externo (ej. URL a tienda online, producto, etc.)
  targetCompletions?: number;   // Límite de veces que se puede canjear (opcional; si no se define, es infinito)
  archived?: boolean;           // Se archiva automáticamente al agotarse targetCompletions
  drawing?: string;             // Imagen o dibujo personalizado opcional
};
```

### 2.3 Modelo de Transacción (`CoinTransaction`)
```typescript
export type TransactionType =
  | 'HABIT_COMPLETION'    // Ganancia por completar hábito recurrente
  | 'TASK_COMPLETION'     // Ganancia por completar tarea única
  | 'HABIT_UNDO'          // Descuento por desmarcar hábito
  | 'TASK_UNDO'           // Descuento por desmarcar tarea
  | 'WISH_REDEMPTION'     // Gasto por canjear recompensa de la lista de deseos
  | 'MANUAL_ADJUSTMENT';  // Ajuste manual por el usuario o administrador

export interface CoinTransaction {
  id: string;
  amount: number;               // Positivo (ingreso) o negativo (gasto)
  type: TransactionType;
  description: string;          // Descripción legible (ej. "Completó: Lectura diaria")
  timestamp: string;            // Fecha y hora en formato ISO UTC
  relatedItemId?: string;       // ID del hábito o del ítem de recompensa vinculado
  note?: string;                // Nota personal opcional agregada a la transacción
  userId?: string;              // Identificador del usuario propietario
}

export interface CoinsData {
  balance: number;              // Saldo total disponible
  transactions: CoinTransaction[]; // Lista cronológica de transacciones
}
```

---

## 3. Flujo Lógico y Reglas de Negocio

### 3.1 Cómo se ganan monedas al completar un hábito
1. El usuario marca como completado un hábito o tarea.
2. Se verifica si se alcanzó la meta de repeticiones del día (`completionsToday + 1 === targetCompletions`).
3. Si se alcanza la meta:
   - Se crea una transacción con monto positivo (`+habit.coinReward`).
   - Tipo de transacción: `HABIT_COMPLETION` o `TASK_COMPLETION`.
   - Se actualiza el saldo: `balance = balance + habit.coinReward`.
   - Se reproduce efecto sonoro de recompensa y se lanza una notificación con botón de deshacer (*Undo*).

```typescript
// Lógica simplificada de acreditación
const updatedCoins = await addCoins({
  amount: habit.coinReward,
  description: `Completado: ${habit.name}`,
  type: habit.isTask ? 'TASK_COMPLETION' : 'HABIT_COMPLETION',
  relatedItemId: habit.id,
});
```

### 3.2 Cómo funciona el Deshacer (*Undo*)
Si el usuario desmarca un hábito que ya había acreditado monedas:
1. Se remueve la última fecha de cumplimiento.
2. Si el hábito estaba en el valor objetivo (`target`), se crea una transacción inversa:
   - Monto: `-habit.coinReward`.
   - Tipo de transacción: `HABIT_UNDO` o `TASK_UNDO`.
   - Saldo: `balance = balance - habit.coinReward`.
3. Esto garantiza que el usuario no pueda explotar el sistema marcando y desmarcando repetidamente para inflar su saldo.

---

### 3.3 Cómo se canjea una recompensa de la Lista de Deseos
1. **Validación de saldo:** Se evalúa si `balance >= item.coinCost`. Si el saldo es insuficiente, se rechaza la acción y se notifica cuántas monedas faltan (`item.coinCost - balance`).
2. **Validación de stock/límite:** Si el ítem tiene `targetCompletions` definido y su valor es `<= 0`, se bloquea el canje por límite alcanzado.
3. **Ejecución del débito:**
   - Se crea una transacción de débito con monto negativo:
     ```typescript
     await removeCoins({
       amount: item.coinCost,
       description: `Recompensa canjeada: ${item.name}`,
       type: 'WISH_REDEMPTION',
       relatedItemId: item.id
     });
     ```
   - Saldo actualizado: `balance = balance - item.coinCost`.
4. **Actualización de stock del ítem:**
   - Si tiene `targetCompletions`, se reduce en 1: `targetCompletions - 1`.
   - Si llega a 0, el ítem se marca automáticamente como archivado (`archived: true`).
5. **Celebración:** Se dispara una animación festiva (confeti / emojis) en la interfaz.
6. **Enlace web directo (`link`):** La tarjeta de la recompensa muestra un botón interactivo o enlace si se proporcionó una URL externa, facilitando ir a la tienda o sitio para disfrutar la recompensa en la vida real.

---

## 4. Métricas y Estadísticas Calculadas
A partir del historial de transacciones (`transactions`), el sistema calcula dinámicamente:
- **Monedas ganadas hoy:** Suma de montos positivos con fecha de hoy según la zona horaria del usuario.
- **Monedas gastadas hoy:** Suma de débitos con fecha de hoy.
- **Total histórico ganado:** Suma de todas las transacciones positivas históricas.
- **Total histórico gastado:** Suma de todas las transacciones negativas históricas.
- **Conteo de transacciones hoy:** Cantidad de movimientos registrados en el día.

---

## 5. Recomendaciones para Implementar esta Lógica en Rastro

Para incorporar este sistema en **Rastro** conectado con **Supabase** (y Google Sheets):

1. **Tabla en Supabase (`coin_transactions`):**
   ```sql
   create table coin_transactions (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id),
     amount integer not null, -- Positivo o negativo
     type text not null,      -- 'HABIT_COMPLETION', 'WISH_REDEMPTION', etc.
     description text not null,
     related_item_id text,
     note text,
     created_at timestamp with time zone default now()
   );
   ```
2. **Columna de saldo en el perfil:** O bien un campo `coins_balance` en la tabla de usuarios/perfil actualizado mediante trigger atómico en cada inserción de transacción, o calculado vía función SQL `sum(amount)`.
3. **Campo en tabla de hábitos:** Agregar `coin_reward integer default 10`.
4. **Tabla de lista de deseos (`wishlist_items`):**
   ```sql
   create table wishlist_items (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users(id),
     name text not null,
     description text,
     coin_cost integer not null check (coin_cost > 0),
     link text,
     target_completions integer,
     is_archived boolean default false,
     created_at timestamp with time zone default now()
   );
   ```
5. **Gatillo Psicológico:** Enlazar la ganancia de monedas con las rachas (por ejemplo: si la racha supera los 7 días, un multiplicador del 1.2x en la recompensa de monedas).
