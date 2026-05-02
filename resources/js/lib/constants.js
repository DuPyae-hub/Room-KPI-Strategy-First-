export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DAY_LABELS = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
};

/** Vertical axis: static academic blocks (24h minutes). */
export const SCHEDULE_ROWS = [
    { label: '09:00 – 11:00', startMin: 9 * 60, endMin: 11 * 60 },
    { label: '11:00 – 01:00', startMin: 11 * 60, endMin: 13 * 60 },
    { label: '01:00 – 03:00', startMin: 13 * 60, endMin: 15 * 60 },
    { label: '03:00 – 05:00', startMin: 15 * 60, endMin: 17 * 60 },
];

export const CLUB_OPTIONS = [
    'Myanmar Culture',
    'Dance Club',
    'Music Club',
    'Art Club',
    'Others (Class)',
];

/** Whole & half hours — flexible booking duration */
export const DURATION_OPTIONS_HOURS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8];

export const MYANMAR_CULTURE = 'Myanmar Culture';

/** Default duration when Myanmar Culture is selected (e.g. afternoon blocks). */
export const MYANMAR_DEFAULT_DURATION_HOURS = 3;
