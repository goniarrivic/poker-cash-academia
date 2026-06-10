// ─── SITUATION UTILS ──────────────────────────────────────────────────────────
// Helpers compartidos por los módulos de situaciones (situations/*.js).
// No se muestran todavía en la UI — son metadatos internos para futuros filtros
// (p. ej. "solo situaciones OOP", "solo BTN", etc.)

// Orden de actuación postflop (heads-up). El último de la lista actúa en
// último lugar postflop → está "in position" (IP) frente a cualquiera que
// aparezca antes que él en esta lista.
export const POSTFLOP_ORDER = ["SB", "BB", "UTG", "UTG+1", "UTG1", "MP", "MP1", "HJ", "CO", "BTN"];

function rank(pos) {
  const i = POSTFLOP_ORDER.indexOf(pos);
  return i === -1 ? -1 : i;
}

// Devuelve "IP" | "OOP" | null (si no se puede determinar) según la posición
// del héroe (pos) y la del rival (callPos).
export function getIpOop(pos, callPos) {
  const a = rank(pos);
  const b = rank(callPos);
  if (a === -1 || b === -1 || a === b) return null;
  return a > b ? "IP" : "OOP";
}
