<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::where('user_id', Auth::id())->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:entrada,saida',
        ]);

        $category = Category::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'type' => $request->type,
        ]);

        return response()->json(['message' => 'Categoria criada com sucesso!', 'category' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::where('user_id', Auth::id())->findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Categoria excluída com sucesso!']);
    }
}
