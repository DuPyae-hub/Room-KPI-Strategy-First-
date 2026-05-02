import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdminLoginModal({ open, onClose, onLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setError('');
            setPassword('');
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            onLoggedIn(data.token);
            onClose();
        } catch (err) {
            const msg =
                err.response?.data?.message ??
                err.response?.data?.errors?.email?.[0] ??
                'Could not sign in.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-sf-navy">Administrator sign in</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Use your Strategy First dashboard credentials. A secure token is stored in this browser.
                </p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sf-blue focus:outline-none focus:ring-1 focus:ring-sf-blue"
                            autoComplete="current-password"
                            required
                        />
                    </div>
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
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
