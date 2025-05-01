<?php

namespace App\Http\Controllers;

use App\Models\Mytask;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    //
    public function getUserStats(Request $request, $user_id)
    {
        // Validate user
        $user = User::find($user_id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $today = now()->toDateString();

        // Get basic counts
        $totalCreated = Mytask::where('user_id', $user_id)->count();
        $totalCompleted = Mytask::where('user_id', $user_id)->where('completed', 1)->count();
        $totalDue = Mytask::where('user_id', $user_id)
            ->where('completed', 0)
            ->whereDate('dueDate', '>=', $today)
            ->count();
        $totalOverdue = Mytask::where('user_id', $user_id)
            ->where('completed', 0)
            ->whereDate('dueDate', '<', $today)
            ->count();

        // Get weekly activity
        $startDate = now()->subDays(6)->toDateString();
        $weeklyActivity = [];

        for ($i = 0; $i < 7; $i++) {
            $date = now()->subDays(6 - $i)->toDateString();
            $created = Mytask::where('user_id', $user_id)
                ->whereDate('createdDate', $date)
                ->count();
            $completed = Mytask::where('user_id', $user_id)
                ->where('completed', 1)
                ->whereDate('updated_at', $date)
                ->count();

            $weeklyActivity[] = [
                'date' => now()->subDays(6 - $i)->format('D'),
                'created' => $created,
                'completed' => $completed
            ];
        }

        return response()->json([
            'totalCreated' => $totalCreated,
            'totalCompleted' => $totalCompleted,
            'totalDue' => $totalDue,
            'totalOverdue' => $totalOverdue,
            'completionRate' => $totalCreated > 0 ? ($totalCompleted / $totalCreated) * 100 : 0,
            'weeklyActivity' => $weeklyActivity
        ]);
    }
}
