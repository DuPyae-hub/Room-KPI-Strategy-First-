import { Lock, Megaphone } from 'lucide-react';
import {
    DAYS,
    DAY_LABELS,
    SCHEDULE_ROWS,
} from '../lib/constants';
import { bookingsForCell, eventsForCell, isApproved, isPending } from '../lib/bookingUtils';

function formatSlotRange(booking) {
    return `${booking.start_time?.slice(0, 5)} – ${booking.end_time?.slice(0, 5)}`;
}

/**
 * @param {'public' | 'admin'} variant
 */
export default function ScheduleGrid({
    variant = 'public',
    groupedBookings,
    groupedEvents = {},
    onAvailableClick,
    onBookingClick,
    onEventClick,
}) {
    const isAdmin = variant === 'admin';

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-sf-navy text-white">
                        {DAYS.map((d) => (
                            <th key={d} className="min-w-[160px] px-3 py-3 font-semibold">
                                <span className="block">{DAY_LABELS[d]}</span>
                                <span className="text-xs font-normal text-white/70">{d}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {SCHEDULE_ROWS.map((row) => (
                        <tr key={row.label} className="bg-white align-top">
                            {DAYS.map((day) => (
                                <td key={`${day}-${row.label}`} className="border-l border-gray-50 px-2 py-3">
                                    <Cell
                                        day={day}
                                        row={row}
                                        groupedBookings={groupedBookings}
                                        groupedEvents={groupedEvents}
                                        isAdmin={isAdmin}
                                        onAvailableClick={onAvailableClick}
                                        onBookingClick={onBookingClick}
                                        onEventClick={onEventClick}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Cell({
    day,
    row,
    groupedBookings,
    groupedEvents,
    isAdmin,
    onAvailableClick,
    onBookingClick,
    onEventClick,
}) {
    const cellBookings = bookingsForCell(day, row.startMin, row.endMin, groupedBookings);
    const cellEvents = eventsForCell(day, row.startMin, row.endMin, groupedEvents);
    const approved = cellBookings.filter(isApproved);
    const pending = cellBookings.filter(isPending);

    const showAvailable = approved.length === 0;

    const lockedCardClass =
        'rounded-lg border border-sf-blue bg-sf-blue/15 p-2 text-sf-navy shadow-sm text-left w-full';

    const pendingPublicClass =
        'rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-950';

    const pendingAdminClass =
        'rounded-lg border-2 border-orange-500 bg-orange-50 p-2 text-sm text-orange-950 shadow-sm ring-1 ring-orange-200 text-left w-full';

    const eventCardClass =
        'rounded-lg border border-violet-400 bg-violet-50 p-2 text-left text-violet-950 shadow-sm w-full';

    return (
        <div className="flex min-h-[128px] flex-col gap-2">
            {cellEvents.map((ev) => (
                <button
                    key={`event-${ev.id}`}
                    type="button"
                    onClick={() => onEventClick?.(ev)}
                    className={`${eventCardClass} cursor-pointer transition hover:ring-2 hover:ring-violet-300`}
                >
                    <div className="flex items-start gap-2">
                        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700">Event</p>
                            <p className="font-semibold leading-snug">{ev.title}</p>
                            <p className="mt-1 font-mono text-[11px] text-violet-800/90">{formatSlotRange(ev)}</p>
                            <p className="mt-0.5 text-[10px] text-violet-700">Tap for details</p>
                        </div>
                    </div>
                </button>
            ))}
            {approved.map((b) =>
                isAdmin ? (
                    <button
                        key={b.id}
                        type="button"
                        onClick={() => onBookingClick?.(b)}
                        className={`${lockedCardClass} cursor-pointer transition hover:ring-2 hover:ring-sf-blue/50`}
                    >
                        <div className="flex items-start gap-2">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sf-blue" aria-hidden />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold leading-snug">{b.club_name}</p>
                                <p className="text-xs text-gray-800">{b.activity_name}</p>
                                <p className="mt-1 font-mono text-[11px] text-gray-600">{formatSlotRange(b)}</p>
                                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-sf-blue">
                                    Locked · tap to manage
                                </p>
                            </div>
                        </div>
                    </button>
                ) : (
                    <div key={b.id} className={lockedCardClass}>
                        <div className="flex items-start gap-2">
                            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-sf-blue" aria-hidden />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold leading-snug">{b.club_name}</p>
                                <p className="text-xs text-gray-800">{b.activity_name}</p>
                                <p className="mt-1 font-mono text-[11px] text-gray-600">{formatSlotRange(b)}</p>
                            </div>
                        </div>
                    </div>
                ),
            )}
            {pending.map((b) =>
                isAdmin ? (
                    <button
                        key={b.id}
                        type="button"
                        onClick={() => onBookingClick?.(b)}
                        className={`${pendingAdminClass} cursor-pointer transition hover:ring-2 hover:ring-orange-400`}
                    >
                        <p className="font-bold text-orange-900">Pending approval</p>
                        <p className="text-xs">
                            {b.club_name} · {b.activity_name}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-orange-900/90">{formatSlotRange(b)}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                            Tap to edit, approve, or delete
                        </p>
                    </button>
                ) : (
                    <div key={b.id} className={pendingPublicClass}>
                        <p className="font-semibold">Pending approval</p>
                        <p className="text-xs">
                            {b.club_name} · {b.activity_name}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-amber-900/80">{formatSlotRange(b)}</p>
                    </div>
                ),
            )}
            {showAvailable && (
                <button
                    type="button"
                    onClick={() => onAvailableClick(day, row.startMin)}
                    className="mt-auto w-full rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-center text-sm font-semibold text-sf-blue transition hover:border-sf-blue hover:bg-sf-blue/5"
                >
                    Available
                </button>
            )}
        </div>
    );
}
