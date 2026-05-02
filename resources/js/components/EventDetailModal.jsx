import { DAY_LABELS } from '../lib/constants';
import { normalizeApiTime } from '../lib/time';

function formatRange(start, end) {
    const s = normalizeApiTime(start);
    const e = normalizeApiTime(end);
    return `${s} – ${e}`;
}

/**
 * Social-style detail sheet (approx. 4:5 image area like portrait feed posts).
 */
export default function EventDetailModal({ event, open, onClose }) {
    if (!open || !event) {
        return null;
    }

    const hasImage = Boolean(event.image_url?.trim());

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-detail-title"
        >
            <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                    {hasImage ? (
                        <img
                            src={event.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Image placeholder
                            </p>
                            <p className="text-sm text-gray-500">
                                Social media post size (4:5). Add an image URL when editing the event in admin.
                            </p>
                            <div className="mt-4 h-24 w-24 rounded-2xl border-2 border-dashed border-gray-300 bg-white/80" />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100 px-5 py-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <h2 id="event-detail-title" className="text-xl font-bold text-sf-navy">
                            {event.title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                        >
                            Close
                        </button>
                    </div>
                    <p className="font-mono text-sm font-medium text-sf-blue">
                        {formatRange(event.start_time, event.end_time)}
                        {event.day_of_week ? (
                            <span className="ml-2 font-sans text-gray-600">
                                · {DAY_LABELS[event.day_of_week] ?? event.day_of_week}
                            </span>
                        ) : null}
                    </p>
                    {event.location ? (
                        <p className="mt-2 text-sm font-semibold text-gray-800">Location: {event.location}</p>
                    ) : (
                        <p className="mt-2 text-sm italic text-gray-400">Location — add in admin</p>
                    )}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        {event.description?.trim() ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                {event.description}
                            </p>
                        ) : (
                            <p className="text-sm italic text-gray-400">
                                Description placeholder — add details when editing this announcement in the admin
                                dashboard.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
