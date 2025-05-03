<?php

namespace App\Http\Controllers;

use App\Models\Mytask;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function addTask(Request $request, $user_id)
    {
        try {
            // Validate the request data

            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'dueDate' => 'required|date',
                'dueTime' => 'required|date_format:H:i',
                'reminder' => 'nullable|boolean',
                'reminderDate' => 'nullable|date|required_if:reminder,true',
                'reminderTime' => 'nullable|date_format:H:i|required_if:reminder,true',
                'completed' => 'nullable|boolean',
            ]);

            // Find the user by user_id from the URL
            $user = User::find($user_id);

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Set default values for createdDate and createdTime if not provided
            // $createdDate = $request->input('createdDate', now()->toDateString());
            // $createdTime = $request->input('createdTime', now()->format('H:i:s'));
            $createdDate = Carbon::now('Asia/Kolkata')->toDateString();
            $createdTime = Carbon::now('Asia/Kolkata')->format('H:i:s');
            // Create the task for the identified user
            $task = Mytask::create([
                'title' => $request->title,
                'description' => $request->description,
                'createdDate' => $createdDate,
                'createdTime' => $createdTime,
                'dueDate' => $request->dueDate,
                'dueTime' => $request->dueTime,
                'reminder' => $request->reminder ?? false,
                'reminderDate' => $request->reminderDate,
                'reminderTime' => $request->reminderTime,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCreatedTodayTasks(Request $request, $user_id)
    {
        try {
            // Validate user_id
            if (!is_numeric($user_id)) {
                return response()->json(['error' => 'Invalid user ID'], 400);
            }

            // Check if user exists
            $user = User::find($user_id);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Get today's tasks
            $today = now()->toDateString();
            $tasks = Mytask::where('user_id', $user_id)
                ->whereDate('createdDate', $today)
                ->orderBy('createdDate', 'desc')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            // Log the error
            return response()->json([
                'error' => 'Server error loading tasks'
            ], 500);
        }
    }
    public function getDueTodayTasks(Request $request, $user_id)
    {
        try {
            // Validate user_id
            if (!is_numeric($user_id)) {
                return response()->json(['error' => 'Invalid user ID'], 400);
            }

            // Check if user exists
            $user = User::find($user_id);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // Get today's tasks
            $today = now()->toDateString();
            $tasks = Mytask::where('user_id', $user_id)
                ->whereDate('dueDate', $today)
                ->orderBy('dueDate')
                ->orderBy('dueTime')
                ->get();

            return response()->json($tasks);
        } catch (\Exception $e) {
            // Log the error
            return response()->json([
                'error' => 'Server error loading tasks'
            ], 500);
        }
    }
    public function updateTask(Request $request, $task_id)
    {
        try {
            // Validate the request data
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'dueDate' => 'required|date',
                'dueTime' => 'required|date_format:H:i',
                'reminder' => 'nullable|boolean',
                'reminderDate' => 'nullable|date|required_if:reminder,true',
                'reminderTime' => 'nullable|date_format:H:i|required_if:reminder,true',
                'completed' => 'nullable|boolean',
            ]);

            // Find the task by ID
            $task = Mytask::find($task_id);

            if (!$task) {
                return response()->json(['error' => 'Task not found'], 404);
            }

            $task->title = $request->title;
            $task->description = $request->description;
            $task->dueDate = $request->dueDate;
            $task->dueTime = $request->dueTime;
            $task->reminder = $request->reminder ?? false;
            $task->reminderDate = $request->reminderDate;
            $task->reminderTime = $request->reminderTime;
            $task->completed = $request->completed ?? false;
            if ($request->has('reminder')) {
                $task->reminder_sent = 0;
            }
            $task->save();

            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getPendingTasks(Request $request, $user_id)
    {
        $search = $request->query('search');
        $today = now()->toDateString();

        $tasks = Mytask::where('user_id', $user_id)
            ->where('completed', false)
            ->whereDate('dueDate', '>=', $today)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%$search%")
                        ->orWhere('description', 'like', "%$search%");
                });
            })
            ->orderBy('dueDate')
            ->orderBy('dueTime')
            ->get();

        return response()->json($tasks);
    }


    public function getOverdueTasks(Request $request, $user_id)
    {
        $search = $request->query('search');
        $today = now()->toDateString();

        $tasks = Mytask::where('user_id', $user_id)
            ->where('completed', false)
            ->whereDate('dueDate', '<', $today)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%$search%")
                        ->orWhere('description', 'like', "%$search%");
                });
            })
            ->orderBy('dueDate', 'desc')
            ->orderBy('dueTime', 'desc')
            ->get();

        return response()->json($tasks);
    }

    public function removeTask(Request $request, $id)
    {
        try {
            $task = Mytask::find($id);
            if (!$task) {
                return response()->json([
                    'error' => 'Task Not Found',
                ], 404);
            }
            $task->delete();


            return response()->json([
                'message' => 'Task deleted successfully'
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Failed to delete task'
            ], 500);
        }
    }
    public function getCompletedTasks(Request $request, $user_id)
    {
        $search = $request->query('search');
        $query = Mytask::where('user_id', $user_id)
            ->where('completed', 1);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderBy('updated_at', 'desc')->get();

        return response()->json($tasks);
    }

    public function getUpcomingReminders(Request $request, $user_id)
    {
        $search = $request->query('search');
        $now = now();
        $query = Mytask::where('user_id', $user_id)
            ->where('reminder', 1)
            ->where('completed', 0)
            ->whereRaw("CONCAT(reminderDate, ' ', reminderTime) > ?", [$now]);
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        return response()->json($query->orderBy('reminderDate')->orderBy('reminderTime')->get());
    }

    public function getPastReminders(Request $request, $user_id)
    {
        $search = $request->query('search');
        $now = now();
        $query = Mytask::where('user_id', $user_id)
            ->where('reminder', 1)
            ->where('completed', 0)
            ->whereRaw("CONCAT(reminderDate, ' ', reminderTime) <= ?", [$now]);
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        return response()->json($query->orderBy('reminderDate', 'desc')->orderBy('reminderTime', 'desc')->get());
    }
}
