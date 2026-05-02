/** Laravel may return "HH:mm" or an ISO fragment — normalize to HH:mm. */
export function normalizeApiTime(value) {
    if (value == null || value === '') {
        return '09:00';
    }
    const s = String(value);
    if (s.includes('T')) {
        return s.slice(11, 16);
    }
    return s.length >= 5 ? s.slice(0, 5) : s;
}

/** Normalize API time string ("9:00", "09:00:00") to minutes from midnight. */
export function timeStrToMinutes(str) {
    if (str == null || str === '') {
        return 0;
    }
    if (typeof str !== 'string') {
        str = String(str);
    }
    const parts = str.trim().split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] ?? 0);
    const s = Number(parts[2] ?? 0);
    return h * 60 + m + Math.round(s / 60);
}

export function minutesToTimeStr(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Add fractional hours to a base minutes value; returns new minutes (same day). */
export function addHoursToMinutes(startMinutes, durationHours) {
    return Math.round(startMinutes + durationHours * 60);
}

/**
 * Half-open [start, end). Touching boundaries do not overlap.
 */
export function rangesOverlapHalfOpen(aStart, aEnd, bStart, bEnd) {
    return !(aEnd <= bStart || bEnd <= aStart);
}

export function formatTimeAmPm(minutes) {
    const h24 = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mm = String(m).padStart(2, '0');
    return `${h12}:${mm} ${period}`;
}
