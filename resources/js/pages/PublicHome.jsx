import { useState } from 'react';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import Navbar from '../components/Navbar';
import ScheduleGrid from '../components/ScheduleGrid';
import { useBookings } from '../hooks/useBookings';

/** Poll so approvals from the dashboard show as locked on the public page quickly. */
const POLL_MS = 12000;

export default function PublicHome() {
    const { groupedBookings, loading, loadError, refreshBookings } = useBookings({
        pollingIntervalMs: POLL_MS,
        refreshOnFocus: true,
    });

    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingModalCtx, setBookingModalCtx] = useState({ day: 'Mon', startMin: 9 * 60 });

    const handleAvailableClick = (day, startMin) => {
        setBookingModalCtx({ day, startMin });
        setBookingModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-sf-bg">
            <Navbar variant="public" />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-sf-navy">Weekly overview</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-600">
                        Locked slots are approved bookings. Choose <strong>Available</strong> to request a time. Staff
                        manage requests from the{' '}
                        <Link to="/admin-panel" className="font-semibold text-sf-blue underline">
                            dashboard
                        </Link>
                        .
                    </p>
                </div>

                {loadError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {loadError}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-20 text-gray-500 shadow-sm">
                        Loading schedule…
                    </div>
                ) : (
                    <ScheduleGrid
                        variant="public"
                        groupedBookings={groupedBookings}
                        onAvailableClick={handleAvailableClick}
                    />
                )}
            </main>

            <BookingModal
                open={bookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                day={bookingModalCtx.day}
                suggestedStartMin={bookingModalCtx.startMin}
                groupedBookings={groupedBookings}
                onCreated={() => refreshBookings({ silent: true })}
            />
        </div>
    );
}
