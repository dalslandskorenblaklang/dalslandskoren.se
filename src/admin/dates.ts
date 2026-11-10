// Editors always enter Swedish local time, regardless of their computer's time zone.
const fmt = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export function stockholmInput(iso: string) {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) return iso;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : fmt.format(date).replace(" ", "T");
}
export function stockholmToIso(local: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  for (const offset of ["+02:00", "+01:00"]) {
    const iso = `${local}:00${offset}`;
    if (stockholmInput(iso) === local) return iso;
  }
  return null; // The clock jumps past this time when summer time starts.
}
