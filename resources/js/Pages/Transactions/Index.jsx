import React, { useEffect, useMemo, useState, useCallback } from "react";
import Shell from "../../Layouts/Shell";
import { api } from "../../bootstrap";

const money = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (s) => {
  if (!s) return "-";
  const [y, m, d] = String(s).split("-");
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-slate-200">
          <div className="px-5 pt-5 pb-2 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsIndex() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const hh = String(today.getHours()).padStart(2, "0");
  const min = String(today.getMinutes()).padStart(2, "0");

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [filters, setFilters] = useState({
    type: "",
    category_id: "",
    group_id: "",
    month: `${yyyy}-${mm}`,
    search: "",
  });

  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [openModal, setOpenModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    tipo: "Despesa", 
    category_id: "",
    group_id: "",
    valor: "",
    datetime: `${yyyy}-${mm}-${dd}T${hh}:${min}`, // UI datetime-local
    observacao: "",
    recorrente: false,
    intervalo: "monthly", // daily|weekly|monthly|yearly
    fim: "", // date (YYYY-MM-DD)
    parcelado: false,
    parcelas: 1,
  });
  const resetModal = useCallback(() => {
    setModalForm({
      tipo: "Despesa",
      category_id: "",
      group_id: "",
      valor: "",
      datetime: `${yyyy}-${mm}-${dd}T${hh}:${min}`,
      observacao: "",
      recorrente: false,
      intervalo: "monthly",
      fim: "",
      parcelado: false,
      parcelas: 1,
    });
  }, [yyyy, mm, dd, hh, min]);

  async function fetchAll() {
    setLoading(true);
    try {
      const params = { ...filters, page, per_page: perPage };
      const [tx, cats, grps] = await Promise.all([
        api("/api/transactions", { params }),
        api("/api/categories"),
        api("/api/groups"),
      ]);

      if (tx && tx.data) {
        setList(tx.data);
        setTotal(tx.total ?? tx.data.length ?? 0);
        setLastPage(tx.last_page ?? 1);
      } else {
        setList(Array.isArray(tx) ? tx : []);
        setTotal(Array.isArray(tx) ? tx.length : 0);
        setLastPage(1);
      }
      setCategories(Array.isArray(cats) ? cats : []);
      setGroups(Array.isArray(grps) ? grps : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [page, perPage, JSON.stringify(filters)]);

  const pages = useMemo(
    () => Math.max(1, lastPage || Math.ceil(total / perPage)),
    [lastPage, total, perPage]
  );

  async function saveFromModal() {
    try {
      const apiPayload = {
        type: modalForm.tipo === "Receita" ? "entrada" : "saida",
        amount: Number(String(modalForm.valor).replace(",", ".")),
        category_id: modalForm.category_id || null,
        group_id: modalForm.group_id || null,
        description: modalForm.observacao || "",
        date: String(modalForm.datetime).slice(0, 10), // API espera 'YYYY-MM-DD'
        is_installment: !!modalForm.parcelado,
        installments: modalForm.parcelado ? Number(modalForm.parcelas || 1) : undefined,
        is_recurring: !!modalForm.recorrente,
        recurrence_interval: modalForm.recorrente ? modalForm.intervalo : undefined,
        recurrence_end_date: modalForm.recorrente ? (modalForm.fim || undefined) : undefined,
      };

      await api("/api/transactions", { method: "POST", body: apiPayload });
      setOpenModal(false);
      resetModal();
      setPage(1);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erro ao salvar.");
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditForm({
      type: row.type,
      amount: row.amount,
      category_id: row.category_id || "",
      group_id: row.group_id || "",
      description: row.description || "",
      is_fixed: !!row.is_fixed,
      is_installment: !!row.is_installment,
      installments: row.installments || 1,
      installment_number: row.installment_number || null,
      is_recurring: !!row.is_recurring,
      recurrence_interval: row.recurrence_interval || "monthly",
      recurrence_end_date: row.recurrence_end_date || "",
      is_active: !!row.is_active,
      date: row.date,
    });
  }

  async function saveEdit(id) {
    try {
      const payload = { ...editForm };
      if (!payload.is_installment) {
        delete payload.installments;
        delete payload.installment_number;
      }
      if (!payload.is_recurring) {
        delete payload.recurrence_interval;
        delete payload.recurrence_end_date;
      }
      await api(`/api/transactions/${id}`, { method: "PUT", body: payload });
      setEditingId(null);
      await fetchAll();
    } catch (e) {
      alert(e?.message || "Erro ao atualizar.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function remove(id) {
    if (!confirm("Excluir esta transação?")) return;
    try {
      await api(`/api/transactions/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (e) {
      alert(e?.message || "Erro ao excluir.");
    }
  }

  async function removeBatch(id) {
    if (!confirm("Excluir o lote inteiro (todas as parcelas/ocorrências)?")) return;
    try {
      await api(`/api/transactions/${id}?delete_batch=1`, { method: "DELETE" });
      await fetchAll();
    } catch (e) {
      alert(e?.message || "Erro ao excluir o lote.");
    }
  }

  const amountClass = (row) =>
    [
      "font-semibold",
      row.type === "entrada" ? "text-green-600" : "text-red-600",
      "tabular-nums",
    ].join(" ");

  return (
    <Shell>
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Gerenciar Transações</h1>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-violet-800"
        >
          Cadastrar nova transação
        </button>
      </div>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200 p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-slate-300 rounded-lg p-2"
        >
          <option value="">Tipo (todos)</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="border border-slate-300 rounded-lg p-2"
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.group_id}
          onChange={(e) => setFilters({ ...filters, group_id: e.target.value })}
          className="border border-slate-300 rounded-lg p-2"
        >
          <option value="">Grupo</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <input
          type="month"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="border border-slate-300 rounded-lg p-2"
        />

        <input
          placeholder="Buscar descrição..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-slate-300 rounded-lg p-2 md:col-span-2"
        />
      </div>

      <div className="bg-white rounded-xl shadow ring-1 ring-slate-200">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3">Transações recentes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="text-left p-3 font-semibold">Data</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
                <th className="text-left p-3 font-semibold">Categoria</th>
                <th className="text-left p-3 font-semibold">Grupo</th>
                <th className="text-right p-3 font-semibold">Valor</th>
                <th className="text-left p-3 font-semibold">Parcela</th>
                <th className="text-left p-3 font-semibold">Recorrente</th>
                <th className="text-right p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center">Carregando...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center">Sem registros</td>
                </tr>
              ) : (
                list.map((row) => {
                  const cat = categories.find((c) => c.id === row.category_id)?.name || "-";
                  const grp = groups.find((g) => g.id === row.group_id)?.name || "-";
                  const parcela = row.is_installment ? `${row.installment_number}/${row.installments}` : "-";
                  const beingEdited = editingId === row.id;

                  return (
                    <tr key={row.id} className="border-t border-slate-100 align-top">
                      <td className="p-3">
                        {beingEdited ? (
                          <input
                            type="date"
                            value={editForm.date || ""}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="border border-slate-300 rounded p-1"
                          />
                        ) : (
                          fmtDate(row.date)
                        )}
                      </td>

                      <td className="p-3">
                        {beingEdited ? (
                          <input
                            value={editForm.description ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="border border-slate-300 rounded p-1 w-full"
                          />
                        ) : (
                          row.description || "-"
                        )}
                      </td>

                      <td className="p-3">
                        {beingEdited ? (
                          <select
                            value={editForm.category_id ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                            className="border border-slate-300 rounded p-1"
                          >
                            <option value="">Categoria</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          cat
                        )}
                      </td>

                      <td className="p-3">
                        {beingEdited ? (
                          <select
                            value={editForm.group_id ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, group_id: e.target.value })}
                            className="border border-slate-300 rounded p-1"
                          >
                            <option value="">Grupo</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          grp
                        )}
                      </td>

                      <td className="p-3 text-right">
                        {beingEdited ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="border border-slate-300 rounded p-1 w-28 text-right"
                          />
                        ) : (
                          <span className={amountClass(row)}>
                            {row.type === "saida" ? "−" : ""}
                            {money(row.amount)}
                          </span>
                        )}
                      </td>

                      <td className="p-3">{parcela}</td>
                      <td className="p-3">{row.is_recurring ? "Sim" : "Não"}</td>

                      <td className="p-3 text-right">
                        {beingEdited ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => saveEdit(row.id)} className="text-green-700 hover:underline">
                              Salvar
                            </button>
                            <button onClick={cancelEdit} className="text-slate-700 hover:underline">
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => startEdit(row)} className="text-violet-700 hover:underline">
                              Editar
                            </button>
                            <button onClick={() => remove(row.id)} className="text-red-700 hover:underline">
                              Excluir
                            </button>
                            {row.batch_id ? (
                              <button onClick={() => removeBatch(row.id)} className="text-red-900 hover:underline">
                                Excluir lote
                              </button>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3">
          <div>Itens: {total}</div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-2 py-1 border border-slate-300 rounded"
            >
              Anterior
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 border border-slate-300 rounded"
            >
              Próxima
            </button>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-300 rounded p-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} title="Cadastrar Transação">
        <div className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Tipo</label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2"
              value={modalForm.tipo}
              onChange={(e) => setModalForm({ ...modalForm, tipo: e.target.value })}
            >
              <option>Receita</option>
              <option>Despesa</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Categoria</label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2"
              value={modalForm.category_id}
              onChange={(e) => setModalForm({ ...modalForm, category_id: e.target.value })}
            >
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Grupo (opcional)</label>
            <select
              className="w-full border border-slate-300 rounded-lg p-2"
              value={modalForm.group_id}
              onChange={(e) => setModalForm({ ...modalForm, group_id: e.target.value })}
            >
              <option value="">Sem grupo</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Valor</label>
            <input
              className="w-full border border-slate-300 rounded-lg p-2"
              type="number"
              step="0.01"
              placeholder="Ex: 1200.00"
              value={modalForm.valor}
              onChange={(e) => setModalForm({ ...modalForm, valor: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Data e hora</label>
            <input
              className="w-full border border-slate-300 rounded-lg p-2"
              type="datetime-local"
              value={modalForm.datetime}
              onChange={(e) => setModalForm({ ...modalForm, datetime: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              Obs.: a API usa somente a data; a hora é para referência visual.
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">Observação</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-2"
              rows={2}
              placeholder="Opcional"
              value={modalForm.observacao}
              onChange={(e) => setModalForm({ ...modalForm, observacao: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="parcelado"
              type="checkbox"
              checked={modalForm.parcelado}
              onChange={(e) => setModalForm({ ...modalForm, parcelado: e.target.checked })}
            />
            <label htmlFor="parcelado" className="font-medium">Parcelado</label>
          </div>

          {modalForm.parcelado && (
            <div>
              <label className="block mb-1 font-medium">Número de parcelas</label>
              <input
                type="number"
                min="1"
                max="120"
                className="w-full border border-slate-300 rounded-lg p-2"
                value={modalForm.parcelas}
                onChange={(e) => setModalForm({ ...modalForm, parcelas: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="recorrente"
              type="checkbox"
              checked={modalForm.recorrente}
              onChange={(e) =>
                setModalForm({
                  ...modalForm,
                  recorrente: e.target.checked,
                  // se marcar recorrente, desmarca parcelado para evitar conflito visual
                  parcelado: e.target.checked ? false : modalForm.parcelado,
                })
              }
            />
            <label htmlFor="recorrente" className="font-medium">Recorrente</label>
          </div>

          {modalForm.recorrente && (
            <>
              <div>
                <label className="block mb-1 font-medium">Intervalo</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2"
                  value={modalForm.intervalo}
                  onChange={(e) => setModalForm({ ...modalForm, intervalo: e.target.value })}
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Até</label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2"
                  type="date"
                  value={modalForm.fim}
                  onChange={(e) => setModalForm({ ...modalForm, fim: e.target.value })}
                />
              </div>
            </>
          )}

          {modalForm.parcelado && modalForm.recorrente && (
            <p className="text-xs text-yellow-700">
              Obs.: quando "Parcelado" está ativo, a recorrência é ignorada pela API. Use apenas um dos dois.
            </p>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={saveFromModal}
              className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800"
            >
              Confirmar
            </button>
            <button
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
