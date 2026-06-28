/**
 * Timezone helpers — the app runs server-side in UTC, but our hostel is in IST.
 *
 * Use these everywhere we need "today" or "now" for the hostel's clock.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30

/**
 * Returns today's date in IST as a YYYY-MM-DD string.
 * Use this for any `date` column comparison (e.g., task_instances.date).
 */
export function todayIST(): string {
  const utcNow = Date.now();
  const istNow = new Date(utcNow + IST_OFFSET_MS);
  // Use UTC accessors on the shifted date — gives us IST values
  const y = istNow.getUTCFullYear();
  const m = String(istNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(istNow.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns current IST hours/minutes as { h, m, totalMinutes }.
 * Use for time-window comparisons.
 */
export function nowIST(): { h: number; m: number; totalMinutes: number } {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const h = istNow.getUTCHours();
  const m = istNow.getUTCMinutes();
  return { h, m, totalMinutes: h * 60 + m };
}

/**
 * Format a UTC timestamp as IST time-of-day string, e.g., "6:32 pm".
 */
export function formatTimeIST(iso: string | Date | null): string {
  if (!iso) return "";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  let h = istDate.getUTCHours();
  const m = istDate.getUTCMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

/**
 * Format a UTC date as IST e.g. "29 Jun".
 */
export function formatDateIST(iso: string | Date | null): string {
  if (!iso) return "";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  const day = istDate.getUTCDate();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[istDate.getUTCMonth()];
  return `${day} ${month}`;
}

/**
 * Returns IST ISO timestamp for "today at H:M" in UTC for DB storage.
 * Example: todayAtIST(21, 0) → today's 9:00 pm IST as UTC ISO string.
 */
export function todayAtIST(hour: number, minute: number = 0): string {
  const istDate = new Date(Date.now() + IST_OFFSET_MS);
  istDate.setUTCHours(hour, minute, 0, 0);
  // Convert back to UTC by subtracting the offset
  return new Date(istDate.getTime() - IST_OFFSET_MS).toISOString();
}
