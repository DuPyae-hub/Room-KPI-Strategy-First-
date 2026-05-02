import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLoginModal from '../components/AdminLoginModal';
import Navbar from '../components/Navbar';
import { adminPath } from '../lib/adminRoutes';
import { api, getStoredToken, initApiAuth, setStoredToken } from '../lib/api';
import { DAYS } from '../lib/constants';
import { useEvents } from '../hooks/useEvents';
import { normalizeApiTime } from '../lib/time';

const DAY_OPTIONS = DAYS;

function flattenEvents(grouped) {
    return Object.values(grouped)
        .flat()
        .sort((a, b) => {
            const da = DAY_OPTIONS.indexOf(a.day_of_week) - DAY_OPTIONS.indexOf(b.day_of_week);
            if (da !== 0) {
                return da;
            }
            return String(a.start_time).localeCompare(String(b.start_time));
        });
}

export default function AdminEventsPage() {
    const navigate = useNavigate();
    const { groupedEvents, loading, error, refreshEvents } = useEvents();
    const [adminSignedIn, setAdminSignedIn] = useState(false);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('Mon');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');

    const [editingId, setEditingId] = useState(null);

    const list = useMemo(() => flattenEvents(groupedEvents), [groupedEvents]);

    useEffect(() => {
        initApiAuth();
        setAdminSignedIn(Boolean(getStoredToken()));
    }, []);

    const handleSignedIn = (token) => {
        setStoredToken(token);
        setAdminSignedIn(true);
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

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setImageUrl('');
        setDayOfWeek('Mon');
        setStartTime('10:00');
        setEndTime('11:00');
        setEditingId(null);
    };

    const submitCreate = async (e) => {
        e.preventDefault();
        if (!adminSignedIn) {
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            await api.post('/events', {
                title: title.trim(),
                description: description.trim() || null,
                location: location.trim() || null,
                image_url: imageUrl.trim() || null,
                day_of_week: dayOfWeek,
                start_time: startTime,
                end_time: endTime,
            });
            resetForm();
            await refreshEvents({ silent: true });
        } catch (err) {
            const msg =
                err.response?.data?.errors?.end_time?.[0] ??
                err.response?.data?.errors?.title?.[0] ??
                err.response?.data?.message ??
                'Could not create event.';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (ev) => {
        setEditingId(ev.id);
        setTitle(ev.title);
        setDescription(ev.description ?? '');
        setLocation(ev.location ?? '');
        setImageUrl(ev.image_url ?? '');
        setDayOfWeek(ev.day_of_week);
        setStartTime(normalizeApiTime(ev.start_time));
        setEndTime(normalizeApiTime(ev.end_time));
    };

    const saveEdit = async (id) => {
        setSaving(true);
        setFormError('');
        try {
            await api.patch(`/events/${id}`, {
                title: title.trim(),
                description: description.trim() || null,
                location: location.trim() || null,
                image_url: imageUrl.trim() || null,
                day_of_week: dayOfWeek,
                start_time: startTime,
                end_time: endTime,
            });
            resetForm();
            await refreshEvents({ silent: true });
        } catch (err) {
            const msg =
                err.response?.data?.errors?.end_time?.[0] ??
                err.response?.data?.message ??
                'Could not update event.';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this announcement?')) {
            return;
        }
        setFormError('');
        try {
            await api.delete(`/events/${id}`);
            if (editingId === id) {
                resetForm();
            }
            await refreshEvents({ silent: true });
        } catch (err) {
            setFormError(err.response?.data?.message ?? 'Could not delete event.');
        }
    };

    return (
        <div className="min-h-screen bg-sf-bg">
            <Navbar
                variant="admin"
                adminSignedIn={adminSignedIn}
                onSignInClick={() => {}}
                onSignOut={handleSignOut}
            />

            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                {adminSignedIn ? (
                    <>
                        <div className="mb-6">
                            <Link
                                to={adminPath()}
                                className="text-sm font-medium text-sf-blue underline hover:no-underline"
                            >
                                ← Back to schedule
                            </Link>
                            <h2 className="mt-2 text-xl font-semibold text-sf-navy">Event announcements</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Appear on the weekly schedule; visitors tap for details (image, time, location,
                                description).
                            </p>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                {formError}
                            </div>
                        )}

                        <form
                        onSubmit={editingId ? (e) => { e.preventDefault(); saveEdit(editingId); } : submitCreate}
                        className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-sf-navy">
                            {editingId ? 'Edit announcement' : 'Add announcement'}
                        </h3>
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600">Event name</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Day</label>
                                    <select
                                        value={dayOfWeek}
                                        onChange={(e) => setDayOfWeek(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        disabled={saving}
                                    >
                                        {DAY_OPTIONS.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Image URL (optional)</label>
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        placeholder="https://…"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">Start</label>
                                    <input
                                        type="time"
                                        step={900}
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600">End</label>
                                    <input
                                        type="time"
                                        step={900}
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Room / venue"
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Details for the popup…"
                                    disabled={saving}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={saving || !title.trim()}
                                    className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                                >
                                    {editingId ? 'Save changes' : 'Add announcement'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel edit
                                    </button>
                                )}
                            </div>
                        </div>
                        </form>

                        {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                        {loading ? (
                            <p className="text-gray-500">Loading…</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {list.map((ev) => (
                            <li
                                key={ev.id}
                                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-sf-navy">{ev.title}</p>
                                    <p className="text-xs text-gray-600">
                                        {ev.day_of_week} · {normalizeApiTime(ev.start_time)}–
                                        {normalizeApiTime(ev.end_time)}
                                        {ev.location ? ` · ${ev.location}` : ''}
                                    </p>
                                </div>
                                {adminSignedIn && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(ev)}
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(ev.id)}
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                        {list.length === 0 && !loading && (
                            <li className="px-4 py-8 text-center text-sm text-gray-500">No announcements yet.</li>
                        )}
                            </ul>
                        )}
                    </>
                ) : (
                    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-sf-navy">Staff sign-in required</h2>
                        <p className="mt-3 text-sm text-gray-600">
                            Sign in below to manage event announcements, or return to the public site.
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

            <AdminLoginModal
                open={!adminSignedIn}
                onClose={() => {}}
                onCancel={() => navigate('/')}
                onLoggedIn={handleSignedIn}
            />
        </div>
    );
}
