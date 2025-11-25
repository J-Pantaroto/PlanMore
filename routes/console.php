<?php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('planmore:check-goals')
    ->dailyAt('09:00')
    ->description('Notifica metas próximas de serem atingidas');

Schedule::command('planmore:check-inactivity')
    ->dailyAt('20:00')
    ->description('Notifica inatividade de lançamentos');

Schedule::command('planmore:notify-recurring')
    ->hourly()
    ->description('Notifica criação automática de transações recorrentes');