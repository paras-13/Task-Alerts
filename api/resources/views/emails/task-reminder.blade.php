<x-mail::message>
    # Task Reminder: {{ $task->title }}

    Your task **{{ $task->title }}** is due soon!

    **Due Date:** {{ $task->dueDate->format('Y-m-d') }} at {{ $task->dueTime }}

    <x-mail::button :url="route('tasks.show', $task)">
        View Task Details
    </x-mail::button>

    Thanks,<br>
    {{ config('app.name') }}
</x-mail::message>