<?php

namespace Database\Seeders;

use App\Models\Club;
use Illuminate\Database\Seeder;

class ClubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = [
            'Myanmar Culture',
            'Dance Club',
            'Music Club',
            'Sports Club',
            'Others (Class)',
            'Art Club',
            'Media',
        ];

        foreach ($names as $order => $name) {
            Club::query()->firstOrCreate(
                ['name' => $name],
                ['sort_order' => $order],
            );
        }
    }
}
