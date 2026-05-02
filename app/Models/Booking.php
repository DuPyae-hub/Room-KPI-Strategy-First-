<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'day_of_week',
        'start_time',
        'end_time',
        'club_name',
        'activity_name',
        'status',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime:H:i',
            'end_time' => 'datetime:H:i',
            'is_locked' => 'boolean',
        ];
    }

    /**
     * Half-open intervals [start, end): touching endpoints do not overlap (e.g. 12:00–14:00 and 14:00–17:00).
     */
    public static function rangesOverlapHalfOpen(
        string|DateTimeInterface $aStart,
        string|DateTimeInterface $aEnd,
        string|DateTimeInterface $bStart,
        string|DateTimeInterface $bEnd,
    ): bool {
        $s1 = self::timeToSeconds($aStart);
        $e1 = self::timeToSeconds($aEnd);
        $s2 = self::timeToSeconds($bStart);
        $e2 = self::timeToSeconds($bEnd);

        return ! ($e1 <= $s2 || $e2 <= $s1);
    }

    public static function endIsStrictlyAfterStart(string|DateTimeInterface $start, string|DateTimeInterface $end): bool
    {
        return self::timeToSeconds($end) > self::timeToSeconds($start);
    }

    /**
     * @param  int|null  $exceptBookingId  Exclude this booking when checking (e.g. on update).
     * @param  bool  $onlyApproved  When true, only compare against approved bookings (booked/locked slots).
     */
    public static function hasOverlappingSlot(
        string $dayOfWeek,
        string|DateTimeInterface $startTime,
        string|DateTimeInterface $endTime,
        ?int $exceptBookingId = null,
        bool $onlyApproved = false,
    ): bool {
        $query = static::query()->where('day_of_week', $dayOfWeek);

        if ($onlyApproved) {
            $query->where('status', 'approved');
        }

        if ($exceptBookingId !== null) {
            $query->whereKeyNot($exceptBookingId);
        }

        foreach ($query->get() as $existing) {
            if (self::rangesOverlapHalfOpen(
                $startTime,
                $endTime,
                $existing->start_time,
                $existing->end_time,
            )) {
                return true;
            }
        }

        return false;
    }

    private static function timeToSeconds(string|DateTimeInterface $time): int
    {
        if ($time instanceof DateTimeInterface) {
            return (int) $time->format('H') * 3600
                + (int) $time->format('i') * 60
                + (int) $time->format('s');
        }

        $t = (string) $time;
        if (strlen($t) === 5) {
            $t .= ':00';
        }

        [$h, $m, $s] = array_map('intval', explode(':', $t));

        return $h * 3600 + $m * 60 + $s;
    }
}
