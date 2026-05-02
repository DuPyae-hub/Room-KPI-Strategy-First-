<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class EventController extends Controller
{
    private const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /**
     * Grouped by weekday for the schedule (same keys as bookings).
     */
    public function index(): JsonResponse
    {
        $events = Event::query()
            ->orderByRaw("CASE day_of_week
                WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3
                WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 WHEN 'Sat' THEN 6 WHEN 'Sun' THEN 7
                ELSE 8 END")
            ->orderBy('start_time')
            ->get()
            ->groupBy('day_of_week');

        $grouped = collect(self::DAY_ORDER)
            ->mapWithKeys(fn (string $day) => [
                $day => $events->get($day, collect())->values(),
            ])
            ->all();

        return response()->json($grouped);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedEvent($request, null);

        $event = Event::query()->create($data);

        return response()->json($event, Response::HTTP_CREATED);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $this->validatedEvent($request, $event);

        $event->fill($data);
        $event->save();

        return response()->json($event->fresh());
    }

    public function destroy(Event $event): Response
    {
        $event->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedEvent(Request $request, ?Event $existing): array
    {
        $partial = $existing !== null;

        $rules = [
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'day_of_week' => [$partial ? 'sometimes' : 'required', 'string', Rule::in(self::DAY_ORDER)],
            'start_time' => [$partial ? 'sometimes' : 'required', 'date_format:H:i'],
            'end_time' => [$partial ? 'sometimes' : 'required', 'date_format:H:i'],
        ];

        $data = $request->validate($rules);

        if ($partial && $existing !== null) {
            $clone = $existing->replicate();
            $clone->fill($data);
            $start = $clone->start_time;
            $end = $clone->end_time;
        } else {
            $start = $data['start_time'];
            $end = $data['end_time'];
        }

        if (! Booking::endIsStrictlyAfterStart($start, $end)) {
            throw ValidationException::withMessages([
                'end_time' => ['The end time must be after the start time.'],
            ]);
        }

        return $data;
    }
}
