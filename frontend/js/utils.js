// ════════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════════
export function toHex(n, pad = 8) { return n.toString(16).padStart(pad, '0').toUpperCase(); }

export function timeSince(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)   return Math.floor(diff/60)  + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400)+ 'd ago';
  return new Date(dateStr).toLocaleDateString('en', {month:'short', day:'numeric'});
}
