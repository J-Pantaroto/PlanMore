import React, { useEffect, useState } from "react";
import Shell from "../../Layouts/Shell";
import { api } from "../../bootstrap";

export default function Groups() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/groups");
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim()) return;
    await api("/api/groups", { method: "POST", body: { name } });
    setName("");
    await load();
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;
    await api(`/api/groups/${id}`, { method: "PUT", body: { name: editName } });
    setEditingId(null);
    setEditName("");
    await load();
  }

  async function remove(id) {
    if (!confirm("Excluir este grupo?")) return;
    await api(`/api/groups/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4">Grupos</h1>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200 p-4 mb-6">
        <h2 className="font-semibold mb-3">Novo grupo</h2>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do grupo (ex.: Moradia, Estudos...)"
            className="border border-slate-300 rounded-lg p-2 flex-1"
          />
          <button
            onClick={create}
            className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3">Lista de grupos</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2" className="p-6 text-center">Carregando...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="2" className="p-6 text-center">Nenhum grupo</td></tr>
              ) : (
                list.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-3">
                      {editingId === g.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-slate-300 rounded p-1 w-full"
                        />
                      ) : (
                        g.name
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingId === g.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => saveEdit(g.id)} className="text-green-700 hover:underline">Salvar</button>
                          <button onClick={() => { setEditingId(null); setEditName(""); }} className="text-slate-700 hover:underline">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => { setEditingId(g.id); setEditName(g.name); }} className="text-violet-700 hover:underline">Editar</button>
                          <button onClick={() => remove(g.id)} className="text-red-700 hover:underline">Excluir</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
