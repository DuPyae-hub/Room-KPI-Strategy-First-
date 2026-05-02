<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Club;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ClubController extends Controller
{
    /**
     * Public list for booking forms (ordered).
     */
    public function index(): JsonResponse
    {
        $clubs = Club::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($clubs);
    }

    /**
     * Store a club (admin).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:clubs,name'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ]);

        $club = Club::query()->create([
            'name' => $data['name'],
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($club, Response::HTTP_CREATED);
    }

    /**
     * Update a club (admin).
     */
    public function update(Request $request, Club $club): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('clubs', 'name')->ignore($club->getKey())],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ]);

        $club->fill($data);

        if ($club->isDirty('name')) {
            Booking::query()->where('club_id', $club->getKey())->update(['club_name' => $club->name]);
        }

        $club->save();

        return response()->json($club->fresh());
    }

    /**
     * Delete a club (admin). Blocked if bookings reference it.
     */
    public function destroy(Club $club): Response|JsonResponse
    {
        if (Booking::query()->where('club_id', $club->getKey())->exists()) {
            return response()->json([
                'message' => 'Cannot delete a club that has bookings. Remove or reassign bookings first.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $club->delete();

        return response()->noContent();
    }
}
