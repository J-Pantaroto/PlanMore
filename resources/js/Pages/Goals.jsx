import React, { useEffect, useState } from "react";
import Shell from "../Layouts/Shell";
import { api } from "../bootstrap";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

function getSwalTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  return {
    background: isDark ? "#020617" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
  };
}

const money = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const fmtDate = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return s;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function Goals() {
  const { t } = useTranslation();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    due_date: "",
    type: "saving",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    target_amount: "",
    due_date: "",
    type: "saving",
    description: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/goals");
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.name.trim()) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: t("goals.name_required") || "Informe um nome para a meta.",
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    if (!form.target_amount || Number(form.target_amount) <= 0) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text:
          t("goals.target_required") ||
          "Informe um valor objetivo maior que zero.",
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    const payload = {
      name: form.name.trim(),
      target_amount: Number(form.target_amount),
      due_date: form.due_date || null,
      type: form.type || null,
      description: form.description || null,
    };

    await api("/api/goals", { method: "POST", body: payload });

    setForm({
      name: "",
      target_amount: "",
      due_date: "",
      type: "saving",
      description: "",
    });

    const { background, color, confirmButtonColor } = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.saved"),
      background,
      color,
      confirmButtonColor,
      timer: 1500,
      showConfirmButton: false,
    });

    await load();
  }

  async function saveEdit(id) {
    if (!editData.name.trim()) return;
    if (!editData.target_amount || Number(editData.target_amount) <= 0) return;

    const payload = {
      name: editData.name.trim(),
      target_amount: Number(editData.target_amount),
      due_date: editData.due_date || null,
      type: editData.type || null,
      description: editData.description || null,
    };

    await api(`/api/goals/${id}`, { method: "PUT", body: payload });

    setEditingId(null);
    setEditData({
      name: "",
      target_amount: "",
      due_date: "",
      type: "saving",
      description: "",
    });

    const { background, color, confirmButtonColor } = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.updated"),
      background,
      color,
      confirmButtonColor,
      timer: 1500,
      showConfirmButton: false,
    });

    await load();
  }

  async function remove(id) {
    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    const result = await Swal.fire({
      title: t("alerts.confirm_delete"),
      text: t("goals.title") || "Meta financeira",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
      background,
      color,
      confirmButtonColor,
      cancelButtonColor,
    });

    if (!result.isConfirmed) return;

    await api(`/api/goals/${id}`, { method: "DELETE" });

    const theme2 = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.deleted"),
      background: theme2.background,
      color: theme2.color,
      confirmButtonColor: theme2.confirmButtonColor,
      timer: 1500,
      showConfirmButton: false,
    });

    await load();
  }

  const totalGoals = list.length;
  const totalTarget = list.reduce(
    (acc, g) => acc + (Number(g.target_amount) || 0),
    0
  );
  const withProgress = list.filter((g) => g.current_amount != null);
  const avgProgress =
    withProgress.length > 0
      ? Math.round(
          withProgress.reduce((acc, g) => {
            const target = Number(g.target_amount) || 0;
            const current = Number(g.current_amount) || 0;
            if (!target || target <= 0) return acc;
            return acc + Math.min(100, (current / target) * 100);
          }, 0) / withProgress.length
        )
      : null;

  const typeLabel = (type) => {
    if (!type) return t("goals.type_other") || "Outra";
    if (type === "saving") return t("goals.type_saving") || "Poupança / reserva";
    if (type === "debt") return t("goals.type_debt") || "Quitar dívidas";
    if (type === "investment")
      return t("goals.type_investment") || "Investimento";
    return t("goals.type_other") || "Outra";
  };

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white transition-colors duration-300">
        {t("goals.title") || "Metas financeiras"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-colors duration-300">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("goals.summary_total") || "Total de metas"}
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {totalGoals}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-colors duration-300">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("goals.summary_target_sum") || "Soma dos objetivos"}
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {money(totalTarget)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-colors duration-300">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("goals.summary_avg_progress") || "Progresso médio"}
          </p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {avgProgress === null ? "-" : `${avgProgress}%`}
          </p>
          {avgProgress === null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("goals.summary_hint") ||
                "O progresso é exibido quando a API retornar current_amount para as metas."}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 p-5 mb-8 transition-colors duration-300">
        <h2 className="font-semibold mb-4 text-slate-900 dark:text-white">
          {t("goals.new") || "Nova meta"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("goals.name") || "Nome da meta"}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("goals.add") || "Ex: Reserva de emergência"}
              className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("goals.target") || "Valor objetivo (R$)"}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.target_amount}
              onChange={(e) =>
                setForm({ ...form, target_amount: e.target.value })
              }
              placeholder="Ex: 5000.00"
              className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("goals.due_date") || "Data limite"}
            </label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              {t("goals.type") || "Tipo de meta"}
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            >
              <option value="saving">
                {t("goals.type_saving") || "Poupança / reserva"}
              </option>
              <option value="debt">
                {t("goals.type_debt") || "Quitar dívidas"}
              </option>
              <option value="investment">
                {t("goals.type_investment") || "Investimento"}
              </option>
              <option value="other">
                {t("goals.type_other") || "Outra"}
              </option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            {t("goals.description") || "Descrição / observações"}
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder={
              t("goals.description_placeholder") ||
              "Ex: Usar apenas sob emergências reais, manter sempre 6 meses de despesas."
            }
            className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={create}
            className="px-5 py-2.5 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition"
          >
            {t("buttons.add") || "Adicionar meta"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("goals.list") || "Metas cadastradas"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">
                  {t("goals.name") || "Meta"}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.type") || "Tipo"}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.target") || "Objetivo"}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.due_date") || "Prazo"}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.progress") || "Progresso"}
                </th>
                <th className="text-right p-3 font-semibold">
                  {t("transactions.actions") || "Ações"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    {t("transactions.loading")}
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    {t("goals.no_goals") || "Nenhuma meta cadastrada."}
                  </td>
                </tr>
              ) : (
                list.map((g) => {
                  const target = Number(g.target_amount) || 0;
                  const current = Number(g.current_amount) || 0;
                  const percent =
                    target > 0 ? Math.min(100, (current / target) * 100) : null;

                  return (
                    <tr
                      key={g.id}
                      className="border-t border-slate-100 dark:border-gray-700 transition-colors duration-300"
                    >
                      <td className="p-3 align-top">
                        {editingId === g.id ? (
                          <input
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                       text-slate-900 dark:text-gray-100 rounded p-1 w-full transition-colors duration-300"
                          />
                        ) : (
                          <>
                            <div className="font-semibold">{g.name}</div>
                            {g.description && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {g.description}
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {editingId === g.id ? (
                          <select
                            value={editData.type}
                            onChange={(e) =>
                              setEditData({ ...editData, type: e.target.value })
                            }
                            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                       text-slate-900 dark:text-gray-100 rounded p-1 transition-colors duration-300"
                          >
                            <option value="saving">
                              {t("goals.type_saving") ||
                                "Poupança / reserva"}
                            </option>
                            <option value="debt">
                              {t("goals.type_debt") || "Quitar dívidas"}
                            </option>
                            <option value="investment">
                              {t("goals.type_investment") || "Investimento"}
                            </option>
                            <option value="other">
                              {t("goals.type_other") || "Outra"}
                            </option>
                          </select>
                        ) : (
                          typeLabel(g.type)
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {editingId === g.id ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.target_amount}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                target_amount: e.target.value,
                              })
                            }
                            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                       text-slate-900 dark:text-gray-100 rounded p-1 w-full transition-colors duration-300"
                          />
                        ) : target > 0 ? (
                          money(target)
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {editingId === g.id ? (
                          <input
                            type="date"
                            value={editData.due_date}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                due_date: e.target.value,
                              })
                            }
                            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                       text-slate-900 dark:text-gray-100 rounded p-1 transition-colors duration-300"
                          />
                        ) : (
                          fmtDate(g.due_date)
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {percent === null ? (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {t("goals.no_progress") ||
                              "Sem dados de progresso ainda"}
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                              <span>{money(current)}</span>
                              <span>{percent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-2 bg-violet-600"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right align-top">
                        {editingId === g.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => saveEdit(g.id)}
                              className="text-green-600 hover:underline"
                            >
                              {t("buttons.save")}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditData({
                                  name: "",
                                  target_amount: "",
                                  due_date: "",
                                  type: "saving",
                                  description: "",
                                });
                              }}
                              className="text-slate-600 dark:text-gray-300 hover:underline"
                            >
                              {t("buttons.cancel")}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(g.id);
                                setEditData({
                                  name: g.name || "",
                                  target_amount:
                                    g.target_amount != null
                                      ? String(g.target_amount)
                                      : "",
                                  due_date: g.due_date || "",
                                  type: g.type || "saving",
                                  description: g.description || "",
                                });
                              }}
                              className="text-violet-600 hover:underline"
                            >
                              {t("buttons.edit")}
                            </button>
                            <button
                              onClick={() => remove(g.id)}
                              className="text-red-600 hover:underline"
                            >
                              {t("buttons.delete")}
                            </button>
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
      </div>
    </Shell>
  );
}
