<?php

namespace App\Listeners;

use App\Notifications\TaskReminderNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Events\NotificationSent;
use Illuminate\Queue\InteractsWithQueue;

class MarkTaskReminderAsSent
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NotificationSent $event)
    {
        if ($event->notification instanceof TaskReminderNotification) {
            $event->notification->task->update(['reminder_sent' => true]);
        }
    }
}
