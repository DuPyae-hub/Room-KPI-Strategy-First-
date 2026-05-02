import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminPath } from '../lib/adminRoutes';
import AdminEditModal from '../components/AdminEditModal';
import AdminLoginModal from '../components/AdminLoginModal';
import AdminSlotActionsModal from '../components/AdminSlotActionsModal';
import BookingModal from '../components/BookingModal';
import Navbar from '../components/Navbar';
import ScheduleGrid from '../components/ScheduleGrid';
import { api, getStoredToken, initApiAuth, setStoredToken } from '../lib/api';
import { useBookings } from '../hooks/useBookings';

export default function AdminPanel() {
    const { groupedBookings, loading, loadError, refreshBookings } = useBookings();

    const [adminSignedIn, setAdminSignedIn] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingModalCtx, setBookingModalCtx] = useState({ day: 'Mon', startMin: 9 * 60 });
    const [editBooking, setEditBooking] = useState(null);
    const [actionsBooking, setActionsBooking] = useState(null);

    useEffect(() => {
        initApiAuth();
        const has = Boolean(getStoredToken());
        setAdminSignedIn(has);
        if (!has) {
            setLoginOpen(true);
        }
    }, []);

    const handleSignedIn = (token) => {
        setStoredToken(token);
        setAdminSignedIn(true);
        setLoginOpen(false);
        refreshBookings();
    };

    const handleSignOut = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            //
        }
        setStoredToken(null);
        setAdminSignedIn(false);
        setLoginOpen(true);
    };

    const handleAvailableClick = (day, startMin) => {
        if (!adminSignedIn) {
            setLoginOpen(true);
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
                onSignInClick={() => setLoginOpen(true)}
                onSignOut={handleSignOut}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-sf-navy">Admin dashboard</h2>
                        <p className="mt-1 max-w-2xl text-sm text-gray-600">
                            <strong className="text-orange-600">Orange</strong> cells are pending requests. Locked slots
                            are approved. Click any booking to edit, approve, or delete.{' '}
                            <Link to={adminPath('clubs')} className="font-semibold text-sf-blue underline">
                                Manage clubs
                            </Link>
                            .
                        </p>
                    </div>
                    {!adminSignedIn && (
                        <p className="text-sm font-medium text-amber-800">Sign in to manage bookings.</p>
                    )}
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
                        onAvailableClick={handleAvailableClick}
                        onBookingClick={(b) => setActionsBooking(b)}
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

            <AdminLoginModal
                open={loginOpen}
                onClose={() => setLoginOpen(false)}
                onLoggedIn={handleSignedIn}
            />

            <AdminSlotActionsModal
                booking={actionsBooking}
                open={actionsBooking != null}
                onClose={() => setActionsBooking(null)}
                onEdit={(b) => setEditBooking(b)}
                onApprove={handleApprove}
                onDelete={handleDelete}
            />

            <AdminEditModal
                booking={editBooking}
                open={editBooking != null}
                onClose={() => setEditBooking(null)}
                groupedBookings={groupedBookings}
                onSaved={() => refreshBookings({ silent: true })}
            />
        </div>
    );
}
