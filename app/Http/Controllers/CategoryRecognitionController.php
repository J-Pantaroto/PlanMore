<?php

namespace App\Http\Controllers;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class CategoryRecognitionController extends Controller
{
    public function recognize(Request $request)
    {
        $request->validate(['description' => 'required|string']);

        $keywords = [
            'mercado' => 'Alimentação',
            'uber' => 'Transporte',
            'spotify' => 'Streaming',
            'aluguel' => 'Moradia'
        ];

        foreach ($keywords as $keyword => $category) {
            if (stripos($request->description, $keyword) !== false) {
                $matchedCategory = Category::where('name', $category)->first();
                return response()->json(['category' => $matchedCategory]);
            }
        }

        return response()->json(['category' => null]);
    }}
