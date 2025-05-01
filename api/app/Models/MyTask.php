<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mytask extends Model
{
    use HasFactory;

    // Table name (optional if follows Laravel naming convention)
    protected $table = 'mytasks';

    // Mass assignable attributes
    protected $fillable = [
        'title',
        'description',
        'createdDate',
        'createdTime',
        'dueDate',
        'dueTime',
        'reminder',
        'reminderDate',
        'reminderTime',
        'user_id',
        'completed',
    ];

    // Cast attributes to appropriate data types
    protected $casts = [
        'createdDate' => 'date',
        'createdTime' => 'datetime:H:i:s',
        'dueDate' => 'date',
        'dueTime' => 'datetime:H:i:s',
        'reminder' => 'boolean',
        'reminderDate' => 'date',
        'reminderTime' => 'datetime:H:i:s',
        'completed' => 'boolean',
    ];

    /**
     * Define relationship: Task belongs to a User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
