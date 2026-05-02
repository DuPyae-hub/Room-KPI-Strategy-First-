/**
 * Admin SPA routes (Vite env).
 *
 * VITE_ADMIN_BASE_PATH — URL segment for the staff dashboard (default: admin-panel).
 *   Use an unguessable value on production (e.g. room-staff-x7k2) so the URL is not obvious.
 *   Staff bookmark: https://yoursite.com/<VITE_ADMIN_BASE_PATH>
 *
 * VITE_SHOW_STAFF_DASHBOARD_LINK — if "false", hide "Staff dashboard" on the public navbar
 *   and the inline dashboard link on the public home page (recommended for public Vercel deploys).
 */
const rawBase = import.meta.env.VITE_ADMIN_BASE_PATH ?? 'admin-panel';

/** @type {string} */
export const ADMIN_BASE_PATH =
    String(rawBase)
        .trim()
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .replace(/\/+/g, '/') || 'admin-panel';

/**
 * @param {string} [segment] e.g. "clubs" → /{base}/clubs
 */
export function adminPath(segment = '') {
    const seg = String(segment).replace(/^\/+|\/+$/g, '');
    return seg ? `/${ADMIN_BASE_PATH}/${seg}` : `/${ADMIN_BASE_PATH}`;
}

/** Public UI: show links that navigate to the staff dashboard. */
export function showStaffDashboardLink() {
    const v = import.meta.env.VITE_SHOW_STAFF_DASHBOARD_LINK;
    return v !== 'false' && v !== '0';
}
