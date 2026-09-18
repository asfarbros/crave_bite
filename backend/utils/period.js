// Shared period maths for the admin analytics endpoints.
// Everything is computed in UTC so bucket keys line up with how order dates are stored.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const VALID_RANGES = ['today', 'week', 'month', 'year', 'all'];
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, '0');
const utcDay = (y, m, d) => new Date(Date.UTC(y, m, d));
const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);
const ymd = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const ym = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;

const dayLabel = (d) => `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const monthLabel = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

// Weeks start on Monday.
function startOfWeek(date) {
    const base = utcDay(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return addDays(base, -((base.getUTCDay() + 6) % 7));
}

function weekLabel(start) {
    const end = addDays(start, 6);
    if (start.getUTCMonth() === end.getUTCMonth()) {
        return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
    }
    const startPart = `${start.getUTCDate()} ${MONTHS_SHORT[start.getUTCMonth()]}`;
    const endPart = `${end.getUTCDate()} ${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
    return `${startPart} – ${endPart}`;
}

function resolvePeriod(rangeInput, anchorInput) {
    const range = VALID_RANGES.includes(rangeInput) ? rangeInput : 'month';

    let anchor = anchorInput ? new Date(`${anchorInput}T00:00:00.000Z`) : new Date();
    if (Number.isNaN(anchor.getTime())) anchor = new Date();

    const y = anchor.getUTCFullYear();
    const m = anchor.getUTCMonth();
    const d = anchor.getUTCDate();

    if (range === 'today') {
        const start = utcDay(y, m, d);
        const previousStart = addDays(start, -1);
        return {
            range,
            start,
            end: addDays(start, 1),
            bucket: 'hour',
            label: dayLabel(start),
            previous: { start: previousStart, end: start, label: dayLabel(previousStart) }
        };
    }

    if (range === 'week') {
        const start = startOfWeek(anchor);
        const previousStart = addDays(start, -7);
        return {
            range,
            start,
            end: addDays(start, 7),
            bucket: 'day',
            label: weekLabel(start),
            previous: { start: previousStart, end: start, label: weekLabel(previousStart) }
        };
    }

    if (range === 'year') {
        const start = utcDay(y, 0, 1);
        const previousStart = utcDay(y - 1, 0, 1);
        return {
            range,
            start,
            end: utcDay(y + 1, 0, 1),
            bucket: 'month',
            label: String(y),
            previous: { start: previousStart, end: start, label: String(y - 1) }
        };
    }

    if (range === 'all') {
        const now = new Date();
        return {
            range,
            start: new Date(0),
            end: addDays(utcDay(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()), 1),
            bucket: 'month',
            label: 'All time',
            previous: null
        };
    }

    const start = utcDay(y, m, 1);
    const previousStart = utcDay(y, m - 1, 1);
    return {
        range,
        start,
        end: utcDay(y, m + 1, 1),
        bucket: 'day',
        label: monthLabel(start),
        previous: { start: previousStart, end: start, label: monthLabel(previousStart) }
    };
}

function bucketKey(date, bucket) {
    if (bucket === 'hour') return pad(date.getUTCHours());
    if (bucket === 'month') return ym(date);
    if (bucket === 'year') return String(date.getUTCFullYear());
    return ymd(date);
}

// Ordered, zero-filled buckets for the period. `first`/`last` bound the
// all-time range, which otherwise would start at the epoch.
function buildBuckets(period, first, last) {
    const buckets = [];

    if (period.bucket === 'hour') {
        for (let h = 0; h < 24; h += 1) buckets.push({ key: pad(h), label: `${pad(h)}:00` });
        return buckets;
    }

    if (period.bucket === 'day') {
        const showWeekday = period.range === 'week';
        for (let cursor = period.start; cursor < period.end; cursor = addDays(cursor, 1)) {
            buckets.push({
                key: ymd(cursor),
                label: showWeekday ? `${DAYS_SHORT[cursor.getUTCDay()]} ${cursor.getUTCDate()}` : String(cursor.getUTCDate())
            });
        }
        return buckets;
    }

    if (period.bucket === 'year') {
        if (!first || !last) return buckets;
        for (let y = first.getUTCFullYear(); y <= last.getUTCFullYear(); y += 1) {
            buckets.push({ key: String(y), label: String(y) });
        }
        return buckets;
    }

    // month buckets: a full calendar year, or the span the data actually covers
    if (period.range === 'all') {
        if (!first || !last) return buckets;
        let cursor = utcDay(first.getUTCFullYear(), first.getUTCMonth(), 1);
        const lastMonth = utcDay(last.getUTCFullYear(), last.getUTCMonth(), 1);
        while (cursor <= lastMonth) {
            buckets.push({
                key: ym(cursor),
                label: `${MONTHS_SHORT[cursor.getUTCMonth()]} ${String(cursor.getUTCFullYear()).slice(2)}`
            });
            cursor = utcDay(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1);
        }
        return buckets;
    }

    const year = period.start.getUTCFullYear();
    for (let m = 0; m < 12; m += 1) {
        buckets.push({ key: `${year}-${pad(m + 1)}`, label: MONTHS_SHORT[m] });
    }
    return buckets;
}

// Long all-time spans get yearly buckets so the axis stays readable.
function widenBucketForSpan(period, first, last) {
    if (period.range !== 'all' || !first || !last) return period;
    const months = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + (last.getUTCMonth() - first.getUTCMonth());
    return months > 36 ? { ...period, bucket: 'year' } : period;
}

module.exports = { resolvePeriod, bucketKey, buildBuckets, widenBucketForSpan, VALID_RANGES };
