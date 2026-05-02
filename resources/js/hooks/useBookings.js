import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DAYS } from '../lib/constants';
import { normalizeApiTime } from '../lib/time';

function normalizeGroup(data) {
    const out = {};
    for (const d of DAYS) {
        out[d] = (data[d] ?? []).map((b) => ({
            ...b,
            start_time: normalizeApiTime(b.start_time),
            end_time: normalizeApiTime(b.end_time),
        }));
    }
    return out;
}

/**
 * @param {{ pollingIntervalMs?: number | null, refreshOnFocus?: boolean }} options
 */
export function useBookings(options = {}) {
    const { pollingIntervalMs = null, refreshOnFocus = false } = options;

    const [groupedBookings, setGroupedBookings] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const refreshBookings = useCallback(async (options = {}) => {
        const silent = Boolean(options.silent);
        if (!silent) {
            setLoading(true);
            setLoadError('');
        }
        try {
            const { data } = await api.get('/bookings');
            setGroupedBookings(normalizeGroup(data));
        } catch {
            if (!silent) {
                setLoadError('Could not load the schedule. Please refresh the page.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        refreshBookings();
    }, [refreshBookings]);

    useEffect(() => {
        if (!pollingIntervalMs || pollingIntervalMs <= 0) {
            return undefined;
        }
        const id = window.setInterval(() => refreshBookings({ silent: true }), pollingIntervalMs);
        return () => window.clearInterval(id);
    }, [pollingIntervalMs, refreshBookings]);

    useEffect(() => {
        if (!refreshOnFocus) {
            return undefined;
        }
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                refreshBookings({ silent: true });
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [refreshOnFocus, refreshBookings]);

    return { groupedBookings, loading, loadError, refreshBookings };
}
