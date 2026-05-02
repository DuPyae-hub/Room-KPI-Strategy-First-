<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Club;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slots = [
            ['Mon', '12:00', '14:00', 'Dance Club', 'Dance Club'],
            ['Mon', '14:00', '17:00', 'Myanmar Culture', 'Myanmar Culture'],

            ['Tue', '12:00', '14:00', 'Dance Club', 'Dance Club'],
            ['Tue', '14:00', '17:00', 'Myanmar Culture', 'Myanmar Culture'],

            ['Wed', '10:00', '12:00', 'Media', 'Media'],
            ['Wed', '12:00', '14:00', 'Dance Club', 'Dance Club'],

            ['Thu', '10:00', '12:00', 'Media', 'Media'],
            ['Thu', '12:00', '14:00', 'Dance Club', 'Dance Club'],
            ['Thu', '14:00', '17:00', 'Myanmar Culture', 'Myanmar Culture'],

            ['Fri', '09:00', '11:00', 'Media', 'Media'],
            ['Fri', '16:00', '17:30', 'Myanmar Culture', 'Myanmar Culture'],

            ['Sat', '09:00', '16:00', 'Myanmar Culture', 'Full Day'],
        ];

        foreach ($slots as [$day, $start, $end, $clubName, $activity]) {
            $club = Club::query()->where('name', $clubName)->first();
            if (! $club) {
                continue;
            }

            Booking::query()->create([
                'club_id' => $club->id,
                'day_of_week' => $day,
                'start_time' => $start,
                'end_time' => $end,
                'club_name' => $clubName,
                'activity_name' => $activity,
                'status' => 'approved',
                'is_locked' => true,
            ]);
        }
    }
}
