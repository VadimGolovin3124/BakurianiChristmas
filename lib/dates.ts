export function todayInGeorgia() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tbilisi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
export function validDate(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
export function stayNights(
  start: unknown,
  end: unknown,
  today = todayInGeorgia(),
): string[] {
  if (!validDate(start) || !validDate(end) || start < today || end <= start)
    throw new Error('invalid_dates');
  const count = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (count > 60 || Date.parse(start) > Date.parse(today) + 730 * 86400000)
    throw new Error('invalid_dates');
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.parse(start) + i * 86400000).toISOString().slice(0, 10),
  );
}
export function localDate(v: string) {
  return new Date(v + 'T12:00:00');
}
export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
