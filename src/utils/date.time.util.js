export function formatDateTime(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString("sr-RS");
}
