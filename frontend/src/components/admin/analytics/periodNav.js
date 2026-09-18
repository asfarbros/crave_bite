// Anchor navigation for the analytics period filter.
// Anchors are UTC dates (YYYY-MM-DD) so they line up with the server's period maths.

const toISODate = (d) => d.toISOString().slice(0, 10);
const parseAnchor = (s) => new Date(`${s}T00:00:00.000Z`);

export const todayAnchor = () => toISODate(new Date());

const startOfWeekUTC = (date) => {
  const base = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  base.setUTCDate(base.getUTCDate() - ((base.getUTCDay() + 6) % 7));
  return base;
};

export const shiftAnchor = (range, anchor, direction) => {
  const d = parseAnchor(anchor);
  if (range === "today") d.setUTCDate(d.getUTCDate() + direction);
  else if (range === "week") d.setUTCDate(d.getUTCDate() + 7 * direction);
  else if (range === "month") {
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + direction);
  } else if (range === "year") {
    d.setUTCMonth(0, 1);
    d.setUTCFullYear(d.getUTCFullYear() + direction);
  }
  return toISODate(d);
};

export const canGoForward = (range, anchor) => {
  if (range === "all") return false;
  const a = parseAnchor(anchor);
  const now = new Date();

  if (range === "today") return toISODate(a) < toISODate(now);
  if (range === "week") return startOfWeekUTC(a) < startOfWeekUTC(now);
  if (range === "month") {
    return (
      a.getUTCFullYear() < now.getUTCFullYear() ||
      (a.getUTCFullYear() === now.getUTCFullYear() && a.getUTCMonth() < now.getUTCMonth())
    );
  }
  return a.getUTCFullYear() < now.getUTCFullYear();
};
