<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeEmail;

class EmailController extends Controller
{
    public function send_email()
    {
        $to = "parasupadhyay025@gmail.com";
        $sub = "This is a Testing Mail from Laravel";
        $message = "How Are You?";
        Mail::to($to)->send(new WelcomeEmail($sub, $message));
        return "Email Sending";
    }
}
