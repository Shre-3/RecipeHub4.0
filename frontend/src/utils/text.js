export function formatCookTime(minutes) {
  const total = Number(minutes);

  if (!total || Number.isNaN(total)) {
    return "—";
  }

  if (total <= 60) {
    return `${total} mins`;
  }

  const hours = Math.floor(total / 60);
  const remainingMinutes = total % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}
