<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app');
Route::view('/admin-panel', 'app');

/*
 * Client-side routes (React Router) must return the same shell when refreshed.
 * Registered after / and /admin-panel; does not override /api/* (those routes match first).
 */
Route::fallback(fn () => view('app'));
