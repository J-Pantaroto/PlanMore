<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserPreferenceController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        return response()->json($user->preferences ?? []);
    }


    public function update(Request $request)
    {
        $user = Auth::user();

        $prefs = $request->all();

        $user->preferences = $prefs;
        $user->save();

        return response()->json([
            'success' => true,
            'preferences' => $prefs
        ]);
    }
}
