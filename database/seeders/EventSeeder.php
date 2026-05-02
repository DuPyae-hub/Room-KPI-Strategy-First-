<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Event::query()->firstOrCreate(
            ['title' => 'Open House', 'day_of_week' => 'Wed'],
            [
                'description' => 'Tour the activity rooms and meet club leaders. Everyone welcome.',
                'location' => 'Main activity room',
                'image_url' => null,
                'start_time' => '13:00',
                'end_time' => '15:00',
            ],
        );
    }
}
