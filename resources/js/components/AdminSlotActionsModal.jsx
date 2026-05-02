export default function AdminSlotActionsModal({
    booking,
    open,
    onClose,
    onEdit,
    onApprove,
    onDelete,
}) {
    if (!open || !booking) {
        return null;
    }

    const isPending = booking.status === 'pending';
    const isLocked = booking.status === 'approved';

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-sf-navy">Manage booking</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {isLocked ? 'Locked (approved) slot' : 'Pending request'} · {booking.day_of_week}
                </p>
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                    <p className="font-semibold text-sf-navy">{booking.club_name}</p>
                    <p className="text-gray-700">{booking.activity_name}</p>
                    <p className="mt-2 font-mono text-xs text-gray-600">
                        {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status: {booking.status}
                        {booking.is_locked ? ' · Locked' : ''}
                    </p>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                        type="button"
                        onClick={() => {
                            onEdit(booking);
                            onClose();
                        }}
                        className="rounded-lg bg-sf-blue px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                    >
                        Edit
                    </button>
                    {isPending && (
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await onApprove(booking);
                                    onClose();
                                } catch (e) {
                                    window.alert(
                                        e.response?.data?.message ?? 'Could not approve this booking.',
                                    );
                                }
                            }}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            Approve & lock
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={async () => {
                            if (
                                !window.confirm(
                                    'Delete this booking permanently? This cannot be undone.',
                                )
                            ) {
                                return;
                            }
                            try {
                                await onDelete(booking);
                                onClose();
                            } catch (e) {
                                window.alert(e.response?.data?.message ?? 'Could not delete booking.');
                            }
                        }}
                        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 sm:ml-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
