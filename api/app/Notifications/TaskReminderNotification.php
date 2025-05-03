<?php

namespace App\Notifications;

use App\Models\Mytask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskReminderNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Mytask $task)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject("⏰ Task Reminder: {$this->task->title}")
            ->greeting('Hello,')
            ->line("This is a friendly reminder about your upcoming task:")
            ->line("**Task Title:** {$this->task->title}")
            ->line("**Description:** {$this->task->description}")
            ->line("**Due Date:** {$this->task->dueDate} at {$this->task->dueTime}")
            ->line('')
            ->line("Make sure to complete it before the deadline!")
            ->line('Thank you for using our task management system!')
            ->salutation('Best regards,')
            ->line('Your Task Management Team');
    }


    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [

            'task_id' => $this->task->id,
            'title' => $this->task->title,
        ];
    }
}
