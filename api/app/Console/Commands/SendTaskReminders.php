<?php

namespace App\Console\Commands;

use App\Models\MyTask;
use App\Notifications\TaskReminderNotification;
use Illuminate\Console\Command;

class SendTaskReminders extends Command
{
    protected $signature = 'tasks:send-reminders';

    protected $description = 'Send task reminders to users';

    public function handle()
    {
        $this->info('Checking for due reminders...');

        $tasks = MyTask::with('user')
            ->where('reminder', true)
            ->where('reminder_sent', false)
            ->where(function ($query) {
                $query->whereDate('reminderDate', '<=', now()->toDateString())
                    ->whereTime('reminderTime', '<=', now()->format('H:i:s'));
            })
            ->get();

        if ($tasks->isEmpty()) {
            $this->info('No reminders to send at this time.');
            return;
        }

        foreach ($tasks as $task) {
            $this->info("Found task: {$task->id}, reminder_sent before: {$task->reminder_sent}");

            try {
                // Attempt to send notification
                $task->user->notify(new TaskReminderNotification($task));
                $this->info("Notification dispatched for task {$task->id}.");

                // Now update the reminder_sent flag
                $task->reminder_sent = 1;
                $task->save();
                $this->info("Task {$task->id} updated, reminder_sent after update: " . $task->fresh()->reminder_sent);
            } catch (\Exception $e) {
                $this->error("Failed to send/update task {$task->id}: " . $e->getMessage());
            }
        }
    }
}
