import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DAYS } from '../lib/constants';
import { normalizeApiTime } from '../lib/time';

function normalizeGroup(data) {
    const out = {};
    for (const d of DAYS) {
        out[d] = (data[d] ?? []).map((e) => ({
            ...e,
            start_time: normalizeApiTime(e.start_time),
            end_time: normalizeApiTime(e.end_time),
        }));
    }
    return out;
}

export function useEvents(options = {}) {
    const { pollingIntervalMs = null } = options;

    const [groupedEvents, setGroupedEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const refreshEvents = useCallback(async ({ silent } = {}) => {
        if (!silent) {
            setLoading(true);
            setLoadError('');
        }
        try {
            const { data } = await api.get('/events');
            setGroupedEvents(normalizeGroup(data));
            setLoadError('');
        } catch {
            if (!silent) {
                setLoadError('Could not load announcements.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshEvents();
    }, [refreshEvents]);

    useEffect(() => {
        if (!pollingIntervalMs || pollingIntervalMs <= 0) {
            return undefined;
        }
        const id = window.setInterval(() => refreshEvents({ silent: true }), pollingIntervalMs);
        return () => window.clearInterval(id);
    }, [pollingIntervalMs, refreshEvents]);

    return { groupedEvents, loading, loadError, refreshEvents };
}
