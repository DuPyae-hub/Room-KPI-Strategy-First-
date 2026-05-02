import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminPath } from '../lib/adminRoutes';
import AdminLoginModal from '../components/AdminLoginModal';
import Navbar from '../components/Navbar';
import { api, getStoredToken, initApiAuth, setStoredToken } from '../lib/api';
import { useClubs } from '../hooks/useClubs';

export default function AdminClubsPage() {
    const navigate = useNavigate();
    const { clubs, loading, error, refreshClubs } = useClubs();
    const [adminSignedIn, setAdminSignedIn] = useState(false);
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSort, setEditSort] = useState(0);

    useEffect(() => {
        initApiAuth();
        setAdminSignedIn(Boolean(getStoredToken()));
    }, []);

    const handleSignedIn = (token) => {
        setStoredToken(token);
        setAdminSignedIn(true);
        refreshClubs();
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

    const submitCreate = async (e) => {
        e.preventDefault();
        if (!adminSignedIn) {
            return;
        }
        setFormError('');
        setSaving(true);
        try {
            await api.post('/clubs', {
                name: name.trim(),
                sort_order: Number(sortOrder) || 0,
            });
            setName('');
            setSortOrder(0);
            await refreshClubs({ silent: true });
        } catch (err) {
            const msg =
                err.response?.data?.errors?.name?.[0] ??
                err.response?.data?.message ??
                'Could not create club.';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (c) => {
        setEditingId(c.id);
        setEditName(c.name);
        setEditSort(c.sort_order ?? 0);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id) => {
        setSaving(true);
        try {
            await api.patch(`/clubs/${id}`, {
                name: editName.trim(),
                sort_order: Number(editSort) || 0,
            });
            setEditingId(null);
            await refreshClubs({ silent: true });
        } catch (err) {
            const msg =
                err.response?.data?.errors?.name?.[0] ??
                err.response?.data?.message ??
                'Could not update club.';
            setFormError(msg);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this club? Bookings must be reassigned first.')) {
            return;
        }
        setFormError('');
        try {
            await api.delete(`/clubs/${id}`);
            await refreshClubs({ silent: true });
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Could not delete club.';
            setFormError(msg);
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
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <Link
                                    to={adminPath()}
                                    className="text-sm font-medium text-sf-blue underline hover:no-underline"
                                >
                                    ← Back to schedule
                                </Link>
                                <h2 className="mt-2 text-xl font-semibold text-sf-navy">Clubs</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Add, rename, or remove clubs. Names appear in the public booking form. Deleting is
                                    blocked if any booking uses the club.
                                </p>
                            </div>
                        </div>

                        {formError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {formError}
                    </div>
                )}

                        <form
                            onSubmit={submitCreate}
                        className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h3 className="text-sm font-semibold text-sf-navy">Add club</h3>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                                    placeholder="e.g. Debate Club"
                                    required
                                    disabled={saving}
                                />
                            </div>
                            <div className="w-full sm:w-28">
                                <label className="block text-xs font-medium text-gray-600">Sort</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                                    disabled={saving}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                        </form>

                        {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                        {loading ? (
                            <p className="text-gray-500">Loading clubs…</p>
                        ) : (
                            <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {clubs.map((c) => (
                            <li key={c.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                {editingId === c.id ? (
                                    <>
                                        <div className="flex flex-1 flex-wrap gap-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="min-w-[12rem] flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                value={editSort}
                                                onChange={(e) => setEditSort(e.target.value)}
                                                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => saveEdit(c.id)}
                                                disabled={saving || !editName.trim()}
                                                className="rounded-lg bg-sf-blue px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <p className="font-semibold text-sf-navy">{c.name}</p>
                                            <p className="text-xs text-gray-500">Sort: {c.sort_order ?? 0}</p>
                                        </div>
                                        {adminSignedIn && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(c)}
                                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(c.id)}
                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                        {clubs.length === 0 && !loading && (
                            <li className="px-4 py-8 text-center text-sm text-gray-500">No clubs yet.</li>
                        )}
                            </ul>
                        )}
                    </>
                ) : (
                    <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-sf-navy">Staff sign-in required</h2>
                        <p className="mt-3 text-sm text-gray-600">
                            Sign in below to manage clubs, or return to the public site.
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
