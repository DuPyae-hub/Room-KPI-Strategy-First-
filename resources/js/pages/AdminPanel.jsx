import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminPath } from '../lib/adminRoutes';
import AdminEditModal from '../components/AdminEditModal';
import AdminLoginModal from '../components/AdminLoginModal';
import AdminSlotActionsModal from '../components/AdminSlotActionsModal';
import BookingModal from '../components/BookingModal';
import EventDetailModal from '../components/EventDetailModal';
import Navbar from '../components/Navbar';
import ScheduleGrid from '../components/ScheduleGrid';
import { api, getStoredToken, initApiAuth, setStoredToken } from '../lib/api';
import { useBookings } from '../hooks/useBookings';
import { useEvents } from '../hooks/useEvents';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { groupedBookings, loading: bookingsLoading, loadError, refreshBookings } = useBookings();
    const { groupedEvents, loading: eventsLoading, refreshEvents } = useEvents();
    const loading = bookingsLoading || eventsLoading;

    const [adminSignedIn, setAdminSignedIn] = useState(false);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingModalCtx, setBookingModalCtx] = useState({ day: 'Mon', startMin: 9 * 60 });
    const [editBooking, setEditBooking] = useState(null);
    const [actionsBooking, setActionsBooking] = useState(null);
    const [eventDetail, setEventDetail] = useState(null);

    useEffect(() => {
        initApiAuth();
        setAdminSignedIn(Boolean(getStoredToken()));
    }, []);

    const handleSignedIn = (token) => {
        setStoredToken(token);
        setAdminSignedIn(true);
        refreshBookings();
        refreshEvents();
    };

    const handleSignOut = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            //
        }
        setStoredToken(null);
        setAdminSignedIn(false);
    };

    const handleAvailableClick = (day, startMin) => {
        if (!adminSignedIn) {
            return;
        }
        setBookingModalCtx({ day, startMin });
        setBookingModalOpen(true);
    };

    const handleApprove = async (booking) => {
        await api.post(`/bookings/${booking.id}/approve`);
        await refreshBookings({ silent: true });
    };

    const handleDelete = async (booking) => {
        await api.delete(`/bookings/${booking.id}`);
        await refreshBookings({ silent: true });
    };

    return (
        <div className="min-h-screen bg-sf-bg">
            <Navbar
                variant="admin"
                adminSignedIn={adminSignedIn}
                onSignInClick={() => {}}
                onSignOut={handleSignOut}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {adminSignedIn ? (
                    <>
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-sf-navy">Admin dashboard</h2>
                                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                                    <strong className="text-orange-600">Orange</strong> cells are pending requests.
                                    Locked slots are approved. Click any booking to edit, approve, or delete.{' '}
                                    <Link to={adminPath('clubs')} className="font-semibold text-sf-blue underline">
                                        Clubs
                                    </Link>
                                    {' · '}
                                    <Link to={adminPath('events')} className="font-semibold text-sf-blue underline">
                                        Events
                                    </Link>
                                    .
                                </p>
                            </div>
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
                                variant="admin"
                                groupedBookings={groupedBookings}
                                groupedEvents={groupedEvents}
                                onAvailableClick={handleAvailableClick}
                                onBookingClick={(b) => setActionsBooking(b)}
                                onEventClick={(ev) => setEventDetail(ev)}
                            />
                        )}
                    </>
                ) : (
                    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-sf-navy">Staff sign-in required</h2>
                        <p className="mt-3 text-sm text-gray-600">
                            Enter administrator credentials in the window below to view and manage the schedule.
                            Everyone else can keep using the{' '}
                            <Link to="/" className="font-semibold text-sf-blue underline">
                                public schedule
                            </Link>
                            .
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="mt-8 text-sm font-semibold text-sf-blue underline hover:no-underline"
                        >
                            ← Back to public schedule
                        </button>
                    </div>
                )}
            </main>

            <BookingModal
                open={bookingModalOpen && adminSignedIn}
                onClose={() => setBookingModalOpen(false)}
                day={bookingModalCtx.day}
                suggestedStartMin={bookingModalCtx.startMin}
                groupedBookings={groupedBookings}
                onCreated={() => refreshBookings({ silent: true })}
            />

            <AdminLoginModal
                open={!adminSignedIn}
                onClose={() => {}}
                onCancel={() => navigate('/')}
                onLoggedIn={handleSignedIn}
            />

            <AdminSlotActionsModal
                booking={actionsBooking}
                open={actionsBooking != null && adminSignedIn}
                onClose={() => setActionsBooking(null)}
                onEdit={(b) => setEditBooking(b)}
                onApprove={handleApprove}
                onDelete={handleDelete}
            />

            <AdminEditModal
                booking={editBooking}
                open={editBooking != null && adminSignedIn}
                onClose={() => setEditBooking(null)}
                groupedBookings={groupedBookings}
                onSaved={() => refreshBookings({ silent: true })}
            />

            <EventDetailModal
                open={eventDetail != null && adminSignedIn}
                event={eventDetail}
                onClose={() => setEventDetail(null)}
            />
        </div>
    );
}
