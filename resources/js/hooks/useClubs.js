import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useClubs({ enabled = true } = {}) {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const refreshClubs = useCallback(async ({ silent } = {}) => {
        if (!enabled) {
            setLoading(false);
            return;
        }
        if (!silent) {
            setLoading(true);
        }
        try {
            const { data } = await api.get('/clubs');
            setClubs(Array.isArray(data) ? data : []);
            setError('');
        } catch (e) {
            setError(e.response?.data?.message ?? 'Could not load clubs.');
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        refreshClubs();
    }, [refreshClubs]);

    return { clubs, loading, error, refreshClubs };
}
