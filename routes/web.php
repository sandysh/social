<?php
Route::get('/', function () {
    return view('layout.master');
});

Route::get('/m-login','MockupController@login');
Route::get('/m-dashboard','MockupController@dashboard');
