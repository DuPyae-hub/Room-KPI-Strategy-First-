import { rangesOverlapHalfOpen, timeStrToMinutes } from './time';

export function isApproved(booking) {
    return booking.status === 'approved';
}

export function isPending(booking) {
    return booking.status === 'pending';
}

export function bookingRangeMinutes(booking) {
    return {
        start: timeStrToMinutes(booking.start_time),
        end: timeStrToMinutes(booking.end_time),
    };
}

/** Row window [rowStart, rowEnd) in minutes vs booking half-open; also works for events with start_time/end_time. */
export function bookingOverlapsRow(booking, rowStartMin, rowEndMin) {
    const { start, end } = bookingRangeMinutes(booking);
    return rangesOverlapHalfOpen(start, end, rowStartMin, rowEndMin);
}

/**
 * True if [startMin, endMin) overlaps any approved booking on that day.
 */
export function overlapsApprovedBookings(day, startMin, endMin, groupedBookings, excludeId = null) {
    const list = groupedBookings[day] ?? [];
    for (const b of list) {
        if (!isApproved(b)) {
            continue;
        }
        if (excludeId != null && Number(b.id) === Number(excludeId)) {
            continue;
        }
        const { start, end } = bookingRangeMinutes(b);
        if (rangesOverlapHalfOpen(startMin, endMin, start, end)) {
            return true;
        }
    }
    return false;
}

export function bookingsForCell(day, rowStartMin, rowEndMin, groupedBookings) {
    const list = groupedBookings[day] ?? [];
    return list.filter((b) => bookingOverlapsRow(b, rowStartMin, rowEndMin));
}

/** Scheduled announcements with start_time/end_time per day. */
export function eventsForCell(day, rowStartMin, rowEndMin, groupedEvents) {
    const list = groupedEvents?.[day] ?? [];
    return list.filter((e) => bookingOverlapsRow(e, rowStartMin, rowEndMin));
}

/**
 * All approved (locked) bookings on a day that overlap the requested [startMin, endMin) range.
 */
export function findOverlappingApprovedBookings(
    day,
    startMin,
    endMin,
    groupedBookings,
    excludeId = null,
) {
    const list = groupedBookings[day] ?? [];
    const out = [];
    for (const b of list) {
        if (!isApproved(b)) {
            continue;
        }
        if (excludeId != null && Number(b.id) === Number(excludeId)) {
            continue;
        }
        const { start, end } = bookingRangeMinutes(b);
        if (rangesOverlapHalfOpen(startMin, endMin, start, end)) {
            out.push(b);
        }
    }
    return out;
}
