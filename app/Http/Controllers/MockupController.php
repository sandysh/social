<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class MockupController extends Controller
{
    public function login()
    {
    	return view('mockup.login');
    }

    public function dashboard()
    {
    	return view('mockup.dashboard');
    }

}
