import { useEffect, useMemo, useState } from 'react';
import {
    DURATION_OPTIONS_HOURS,
    MYANMAR_CULTURE,
    MYANMAR_DEFAULT_DURATION_HOURS,
} from '../lib/constants';
import {
    addHoursToMinutes,
    minutesToTimeStr,
    timeStrToMinutes,
} from '../lib/time';
import { findOverlappingApprovedBookings } from '../lib/bookingUtils';
import { api } from '../lib/api';
import { useClubs } from '../hooks/useClubs';

function buildStartOptions() {
    const opts = [];
    for (let m = 8 * 60; m <= 20 * 60; m += 15) {
        opts.push(minutesToTimeStr(m));
    }
    return opts;
}

const START_OPTIONS = buildStartOptions();

export default function BookingModal({
    open,
    onClose,
    day,
    suggestedStartMin,
    groupedBookings,
    onCreated,
}) {
    const { clubs, loading: clubsLoading } = useClubs();
    const [clubId, setClubId] = useState(null);
    const [activityName, setActivityName] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [durationHours, setDurationHours] = useState(2);
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }
        setSubmitError('');
        const initialStart = minutesToTimeStr(suggestedStartMin ?? 9 * 60);
        setStartTime(initialStart);
        setActivityName('');
        setDurationHours(2);
        if (clubs.length > 0) {
            setClubId(clubs[0].id);
        }
    }, [open, suggestedStartMin, day, clubs]);

    const endMinutes = useMemo(() => {
        const start = timeStrToMinutes(startTime);
        return addHoursToMinutes(start, durationHours);
    }, [startTime, durationHours]);

    const endTimeStr = useMemo(() => minutesToTimeStr(endMinutes), [endMinutes]);

    const lockedConflicts = useMemo(() => {
        const start = timeStrToMinutes(startTime);
        return findOverlappingApprovedBookings(day, start, endMinutes, groupedBookings);
    }, [day, startTime, endMinutes, groupedBookings]);

    const clientOverlap = lockedConflicts.length > 0;

    if (!open) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (clubId == null) {
            setSubmitError('Clubs are still loading or unavailable.');
            return;
        }
        if (clientOverlap) {
            setSubmitError('This time slot overlaps with an existing booking.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/bookings', {
                day_of_week: day,
                start_time: startTime,
                end_time: endTimeStr,
                club_id: clubId,
                activity_name: activityName.trim() || 'Activity',
            });
            onCreated?.();
            onClose();
        } catch (err) {
            const msg =
                err.response?.data?.errors?.start_time?.[0] ??
                err.response?.data?.errors?.club_id?.[0] ??
                err.response?.data?.message ??
                'Unable to submit booking.';
            setSubmitError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
        >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="booking-modal-title" className="text-lg font-semibold text-sf-navy">
                            Booking request
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Request a slot for <strong>{day}</strong>. Times use the 24-hour clock.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {clientOverlap && (
                        <div
                            className="rounded-xl border-2 border-orange-500 bg-orange-50 p-4 shadow-sm"
                            role="alert"
                        >
                            <p className="text-sm font-bold uppercase tracking-wide text-orange-900">
                                Conflict alert
                            </p>
                            <p className="mt-2 text-sm text-orange-950">
                                This request overlaps a <strong>locked</strong> (approved) booking on {day}. Adjust your
                                start time or duration, or choose another window.
                            </p>
                            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-orange-950">
                                {lockedConflicts.map((c) => (
                                    <li key={c.id}>
                                        <span className="font-semibold">{c.club_name}</span> — {c.activity_name}{' '}
                                        <span className="font-mono text-xs">
                                            ({c.start_time?.slice(0, 5)}–{c.end_time?.slice(0, 5)})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Club</label>
                        <select
                            value={clubId ?? ''}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setClubId(id);
                                const selected = clubs.find((c) => c.id === id);
                                if (selected?.name === MYANMAR_CULTURE) {
                                    setDurationHours(MYANMAR_DEFAULT_DURATION_HOURS);
                                }
                            }}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            required
                            disabled={clubsLoading || clubs.length === 0}
                        >
                            {clubsLoading && (
                                <option value="">Loading clubs…</option>
                            )}
                            {!clubsLoading &&
                                clubs.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Myanmar Culture defaults to a {MYANMAR_DEFAULT_DURATION_HOURS}-hour duration (e.g. afternoon
                            blocks).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Activity name</label>
                        <input
                            type="text"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            placeholder="e.g. Weekly rehearsal"
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start time</label>
                            <select
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            >
                                {START_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration</label>
                            <select
                                value={durationHours}
                                onChange={(e) => setDurationHours(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            >
                                {DURATION_OPTIONS_HOURS.map((h) => (
                                    <option key={h} value={h}>
                                        {h % 1 === 0 ? `${h} hour${h === 1 ? '' : 's'}` : `${h} hours`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                        <span className="font-medium text-gray-700">Calculated end time: </span>
                        <span className="font-mono text-sf-navy">{endTimeStr}</span>
                        <span className="ml-2 text-gray-500">
                            ({durationHours} h after {startTime})
                        </span>
                    </div>

                    {submitError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                            {submitError}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || clientOverlap || clubId == null || clubsLoading}
                            className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                        >
                            {loading ? 'Submitting…' : 'Submit request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
