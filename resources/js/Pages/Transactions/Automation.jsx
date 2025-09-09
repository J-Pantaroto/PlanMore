import React, { useState } from "react";
import Shell from "../../Layouts/Shell";

export default function Automation() {
  const [rules, setRules] = useState([

  ]);

  const [form, setForm] = useState({
    name: "",
    contains: "",
    action: { set_category: "", set_group: "", mark_recurring: false },
  });

  function addRule() {
    if (!form.name.trim() || !form.contains.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setRules((r) => [...r, { id, ...form }]);
    setForm({ name: "", contains: "", action: { set_category: "", set_group: "", mark_recurring: false } });
  }

  function removeRule(id) {
    setRules((r) => r.filter((x) => x.id !== id));
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4">Automatização</h1>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Nova regra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border border-slate-300 rounded-lg p-2"
            placeholder="Nome da regra (ex.: Assinaturas)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border border-slate-300 rounded-lg p-2"
            placeholder="Se descrição conter (ex.: spotify)"
            value={form.contains}
            onChange={(e) => setForm({ ...form, contains: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <input
              id="mark_recurring"
              type="checkbox"
              checked={form.action.mark_recurring}
              onChange={(e) => setForm({ ...form, action: { ...form.action, mark_recurring: e.target.checked } })}
            />
            <label htmlFor="mark_recurring">Marcar como recorrente</label>
          </div>

          <input
            className="border border-slate-300 rounded-lg p-2"
            placeholder="Definir categoria (id opcional)"
            value={form.action.set_category}
            onChange={(e) => setForm({ ...form, action: { ...form.action, set_category: e.target.value } })}
          />
          <input
            className="border border-slate-300 rounded-lg p-2"
            placeholder="Definir grupo (id opcional)"
            value={form.action.set_group}
            onChange={(e) => setForm({ ...form, action: { ...form.action, set_group: e.target.value } })}
          />

          <div className="flex items-center md:justify-end">
            <button onClick={addRule} className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800">
              Adicionar regra
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          * Em breve podemos salvar essas regras no backend e aplicá-las ao criar/importar transações.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3">Regras ativas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-left p-3 font-semibold">Condição</th>
                <th className="text-left p-3 font-semibold">Ação</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center">Nenhuma regra</td></tr>
              ) : rules.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">Descrição contém: <code>{r.contains}</code></td>
                  <td className="p-3">
                    {r.action.mark_recurring && <span className="mr-2">Marcar recorrente</span>}
                    {r.action.set_category && <span className="mr-2">Categoria: {r.action.set_category}</span>}
                    {r.action.set_group && <span>Grupo: {r.action.set_group}</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => removeRule(r.id)} className="text-red-700 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
