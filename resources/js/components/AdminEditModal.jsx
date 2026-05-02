import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { CLUB_OPTIONS } from '../lib/constants';
import { overlapsApprovedBookings } from '../lib/bookingUtils';
import { normalizeApiTime, timeStrToMinutes } from '../lib/time';

export default function AdminEditModal({ booking, open, onClose, onSaved, groupedBookings }) {
    const [start, setStart] = useState('09:00');
    const [end, setEnd] = useState('10:00');
    const [club, setClub] = useState(CLUB_OPTIONS[0]);
    const [activity, setActivity] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const clubChoices = useMemo(() => {
        const name = booking?.club_name;
        if (name && !CLUB_OPTIONS.includes(name)) {
            return [name, ...CLUB_OPTIONS];
        }
        return CLUB_OPTIONS;
    }, [booking]);

    useEffect(() => {
        if (open && booking) {
            setStart(normalizeApiTime(booking.start_time));
            setEnd(normalizeApiTime(booking.end_time));
            setClub(booking.club_name);
            setActivity(booking.activity_name ?? '');
            setError('');
        }
    }, [open, booking]);

    const day = booking?.day_of_week;

    const overlapWarning = useMemo(() => {
        if (!open || !booking || !day) {
            return false;
        }
        return overlapsApprovedBookings(
            day,
            timeStrToMinutes(start),
            timeStrToMinutes(end),
            groupedBookings,
            booking.id,
        );
    }, [open, booking, day, start, end, groupedBookings]);

    if (!open || !booking) {
        return null;
    }

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.patch(`/bookings/${booking.id}`, {
                day_of_week: day,
                start_time: start,
                end_time: end,
                club_name: club,
                activity_name: activity,
            });
            onSaved?.();
            onClose();
        } catch (err) {
            const msg =
                err.response?.data?.errors?.start_time?.[0] ??
                err.response?.data?.message ??
                'Could not update booking.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-sf-navy">Edit booking (admin)</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Adjust start/end times or metadata directly. Duration presets from the public form do not apply here.
                </p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start</label>
                            <input
                                type="time"
                                step={900}
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End</label>
                            <input
                                type="time"
                                step={900}
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Club</label>
                        <select
                            value={club}
                            onChange={(e) => setClub(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                        >
                            {clubChoices.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Activity</label>
                        <input
                            type="text"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            required
                        />
                    </div>
                    {overlapWarning && (
                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                            Warning: this range overlaps another approved booking. Saving may still fail server-side
                            unless you resolve the conflict.
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                            {error}
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
                            disabled={loading}
                            className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                        >
                            {loading ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
