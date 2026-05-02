<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\BookingClub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    private const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    /**
     * Display all bookings grouped by day (Mon–Sat order).
     */
    public function index(): JsonResponse
    {
        $bookings = Booking::query()
            ->orderByRaw("CASE day_of_week
                WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3
                WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 WHEN 'Sat' THEN 6
                ELSE 7 END")
            ->orderBy('start_time')
            ->get()
            ->groupBy('day_of_week');

        $grouped = collect(self::DAY_ORDER)
            ->mapWithKeys(fn (string $day) => [
                $day => $bookings->get($day, collect())->values(),
            ])
            ->all();

        return response()->json($grouped);
    }

    /**
     * Store a public booking request (pending, not locked).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedPublicBooking($request);

        if (Booking::hasOverlappingSlot($data['day_of_week'], $data['start_time'], $data['end_time'], null, true)) {
            throw ValidationException::withMessages([
                'start_time' => ['This time slot overlaps with an existing booking.'],
            ]);
        }

        $booking = Booking::query()->create([
            ...$data,
            'status' => 'pending',
            'is_locked' => false,
        ]);

        return response()->json($booking, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking): JsonResponse
    {
        return response()->json($booking);
    }

    /**
     * Update the specified resource (admin only).
     */
    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'day_of_week' => ['sometimes', 'string', Rule::in(self::DAY_ORDER)],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => ['sometimes', 'date_format:H:i'],
            'club_name' => ['sometimes', 'string', Rule::in(BookingClub::NAMES)],
            'activity_name' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'approved'])],
            'is_locked' => ['sometimes', 'boolean'],
        ]);

        $booking->fill($data);

        $day = $booking->day_of_week;
        $start = $booking->start_time;
        $end = $booking->end_time;

        if (! Booking::endIsStrictlyAfterStart($start, $end)) {
            throw ValidationException::withMessages([
                'end_time' => ['The end time must be after the start time.'],
            ]);
        }

        if (Booking::hasOverlappingSlot($day, $start, $end, $booking->getKey(), true)) {
            throw ValidationException::withMessages([
                'start_time' => ['This time slot overlaps with an existing booking.'],
            ]);
        }

        $booking->save();

        return response()->json($booking->fresh());
    }

    /**
     * Approve a booking (admin only): approved + locked.
     */
    public function approve(Booking $booking): JsonResponse
    {
        $booking->update([
            'status' => 'approved',
            'is_locked' => true,
        ]);

        return response()->json($booking->fresh());
    }

    /**
     * Remove the specified resource (admin only).
     */
    public function destroy(Booking $booking): Response
    {
        $booking->delete();

        return response()->noContent();
    }

    /**
     * @return array{day_of_week: string, start_time: string, end_time: string, club_name: string, activity_name: string}
     */
    private function validatedPublicBooking(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'day_of_week' => ['required', 'string', Rule::in(self::DAY_ORDER)],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'club_name' => ['required', 'string', Rule::in(BookingClub::NAMES)],
            'activity_name' => ['required', 'string', 'max:255'],
        ]);

        $validator->after(function ($validator) use ($request): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $start = $request->input('start_time');
            $end = $request->input('end_time');

            if (! Booking::endIsStrictlyAfterStart($start, $end)) {
                $validator->errors()->add('end_time', 'The end time must be after the start time.');
            }
        });

        /** @var array{day_of_week: string, start_time: string, end_time: string, club_name: string, activity_name: string} $data */
        return $validator->validate();
    }
}
