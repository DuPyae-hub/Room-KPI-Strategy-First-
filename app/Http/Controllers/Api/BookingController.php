<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Club;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class BookingController extends Controller
{
    private const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /**
     * Display all bookings grouped by day (Mon–Sun order).
     */
    public function index(): JsonResponse
    {
        $bookings = Booking::query()
            ->with('club')
            ->orderByRaw("CASE day_of_week
                WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3
                WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 WHEN 'Sat' THEN 6 WHEN 'Sun' THEN 7
                ELSE 8 END")
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
     * Store a booking request. Public (no bearer token) → pending.
     * Authenticated admin bearer token → approved and locked (same as approving a request).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedPublicBooking($request);
        $adminUser = $this->optionalAdminFromBearer($request);

        if (Booking::hasOverlappingSlot($data['day_of_week'], $data['start_time'], $data['end_time'], null, true)) {
            throw ValidationException::withMessages([
                'start_time' => ['This time slot overlaps with an existing booking.'],
            ]);
        }

        $club = Club::query()->findOrFail($data['club_id']);
        $asAdmin = $adminUser !== null;

        $booking = Booking::query()->create([
            'club_id' => $club->id,
            'club_name' => $club->name,
            'day_of_week' => $data['day_of_week'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'activity_name' => $data['activity_name'],
            'status' => $asAdmin ? 'approved' : 'pending',
            'is_locked' => $asAdmin,
        ]);

        $booking->load('club');

        return response()->json($booking, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking): JsonResponse
    {
        $booking->load('club');

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
            'club_id' => ['sometimes', 'integer', Rule::exists('clubs', 'id')],
            'activity_name' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'approved'])],
            'is_locked' => ['sometimes', 'boolean'],
        ]);

        $booking->fill($data);

        if (array_key_exists('club_id', $data) && $data['club_id'] !== null) {
            $club = Club::query()->find($data['club_id']);
            if ($club) {
                $booking->club_name = $club->name;
            }
        }

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

        return response()->json($booking->fresh()->load('club'));
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

        return response()->json($booking->fresh()->load('club'));
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
     * When no bearer token: public booking. When bearer token present: must be a valid admin token.
     *
     * @return User|null Admin user if token identifies an admin; null if no Authorization header.
     */
    private function optionalAdminFromBearer(Request $request): ?User
    {
        $token = $request->bearerToken();
        if ($token === null || $token === '') {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if ($accessToken === null) {
            abort(Response::HTTP_UNAUTHORIZED, 'Invalid or expired token.');
        }

        $user = $accessToken->tokenable;
        if (! $user instanceof User) {
            abort(Response::HTTP_UNAUTHORIZED, 'Invalid token.');
        }

        if (! $user->is_admin) {
            abort(Response::HTTP_FORBIDDEN, 'Only administrators can create approved slots directly.');
        }

        return $user;
    }

    /**
     * @return array{club_id: int, day_of_week: string, start_time: string, end_time: string, activity_name: string}
     */
    private function validatedPublicBooking(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'club_id' => ['required', 'integer', Rule::exists('clubs', 'id')],
            'day_of_week' => ['required', 'string', Rule::in(self::DAY_ORDER)],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
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

        /** @var array{club_id: int, day_of_week: string, start_time: string, end_time: string, activity_name: string} $valid */
        $valid = $validator->validate();

        return $valid;
    }
}
