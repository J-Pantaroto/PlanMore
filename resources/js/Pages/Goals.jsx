import React, { useEffect, useMemo, useState } from "react";
import Shell from "@/Layouts/Shell";
import { api } from "@/bootstrap";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

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

const fmtDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("pt-BR");
};

export default function Goals() {
  const { t } = useTranslation();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewForm, setShowNewForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    deadline: "",
  });

  const totals = useMemo(() => {
    if (!goals.length) {
      return { count: 0, totalTarget: 0, avgProgress: 0 };
    }

    const count = goals.length;
    const totalTarget = goals.reduce(
      (sum, g) => sum + (Number(g.target_amount) || 0),
      0
    );

    const avgProgress =
      goals.reduce((acc, g) => {
        const target = Number(g.target_amount) || 0;
        const current = Number(g.current_amount) || 0;
        if (!target) return acc;
        return acc + (current / target) * 100;
      }, 0) / count;

    return {
      count,
      totalTarget,
      avgProgress: Number.isFinite(avgProgress) ? avgProgress : 0,
    };
  }, [goals]);

  async function loadGoals() {
    setLoading(true);
    try {
      const data = await api("/api/goals");
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e?.message || "Falha ao carregar metas.",
        background,
        color,
        confirmButtonColor,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      target_amount: "",
      deadline: "",
    });
  }

  async function handleCreate(e) {
    e.preventDefault();

    const { background, color, confirmButtonColor } = getSwalTheme();

    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: t("goals.name") || "Informe o nome da meta.",
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    const target = Number(
      String(form.target_amount).replace(".", "").replace(",", ".")
    );
    if (!target || target <= 0) {
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: t("goals.target") || "Informe um valor objetivo válido.",
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        target_amount: target,
        deadline: form.deadline || null,
      };

      await api("/api/goals", {
        method: "POST",
        body: payload,
      });

      await loadGoals();
      resetForm();
      setShowNewForm(false);

      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: t("alerts.saved"),
        background,
        color,
        confirmButtonColor,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e?.message || "Erro ao criar meta.",
        background,
        color,
        confirmButtonColor,
      });
    }
  }

  async function handleDelete(goal) {
    if (!goal?.id) return;

    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    const confirm = await Swal.fire({
      icon: "warning",
      title: t("alerts.confirm_delete"),
      text: `${t("goals.name")}: ${goal.name || ""}`,
      showCancelButton: true,
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
      background,
      color,
      confirmButtonColor,
      cancelButtonColor,
    });

    if (!confirm.isConfirmed) return;

    try {
      await api(`/api/goals/${goal.id}`, { method: "DELETE" });

      setGoals((prev) => prev.filter((g) => g.id !== goal.id));

      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: t("alerts.deleted"),
        background,
        color,
        confirmButtonColor,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e?.message || "Erro ao excluir meta.",
        background,
        color,
        confirmButtonColor,
      });
    }
  }

  async function handleCancel(goal) {
    if (!goal?.id) return;

    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Cancelar meta?",
      text: `A meta "${goal.name}" será marcada como cancelada, mas o histórico será mantido.`,
      showCancelButton: true,
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
      background,
      color,
      confirmButtonColor,
      cancelButtonColor,
    });

    if (!confirm.isConfirmed) return;

    try {
      const updated = await api(`/api/goals/${goal.id}`, {
        method: "PUT",
        body: { status: "cancelada" },
      });

      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? updated : g))
      );

      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: "Meta cancelada.",
        background,
        color,
        confirmButtonColor,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e?.message || "Erro ao cancelar meta.",
        background,
        color,
        confirmButtonColor,
      });
    }
  }

  async function handleEditTarget(goal) {
    if (!goal?.id) return;

    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    const result = await Swal.fire({
      title: "Atualizar valor da meta",
      text: `Defina um novo valor objetivo para "${goal.name}".`,
      input: "number",
      inputLabel: "Novo valor objetivo",
      inputValue: goal.target_amount,
      inputAttributes: {
        min: "0",
        step: "0.01",
      },
      showCancelButton: true,
      confirmButtonText: t("buttons.save"),
      cancelButtonText: t("buttons.cancel"),
      background,
      color,
      confirmButtonColor,
      cancelButtonColor,
      preConfirm: (value) => {
        const num = Number(String(value).replace(",", "."));
        if (!num || num <= 0) {
          Swal.showValidationMessage("Informe um valor válido maior que zero.");
          return false;
        }
        return num;
      },
    });

    if (!result.isConfirmed) return;

    const newTarget = Number(result.value);

    try {
      const updated = await api(`/api/goals/${goal.id}`, {
        method: "PUT",
        body: { target_amount: newTarget },
      });

      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? updated : g))
      );

      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: "Valor da meta atualizado.",
        background,
        color,
        confirmButtonColor,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e?.message || "Erro ao atualizar valor da meta.",
        background,
        color,
        confirmButtonColor,
      });
    }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {t("goals.title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-300">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 mb-1">
            TOTAL DE METAS
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totals.count}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-300">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 mb-1">
            SOMA DOS OBJETIVOS
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {money(totals.totalTarget)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 transition-colors duration-300">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 mb-1">
            PROGRESSO MÉDIO
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {totals.avgProgress.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text白">
          {t("goals.new")}
        </h2>

        {!showNewForm && (
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 rounded-lg bg-violet-700 text-white text-sm font-medium hover:bg-violet-800 transition"
          >
            {t("buttons.add")} {t("goals.new").toLowerCase()}
          </button>
        )}
      </div>

      {showNewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8 transition-colors duration-300">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-gray-100 mb-1">
                  {t("goals.name")}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder={t("goals.name")}
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-gray-100 mb-1">
                  {t("goals.target")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.target_amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, target_amount: e.target.value }))
                  }
                  placeholder="Ex: 5000.00"
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-gray-100 mb-1">
                  {t("goals.due_date")}
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deadline: e.target.value }))
                  }
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowNewForm(false);
                }}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-gray-600 text-sm font-medium"
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-sm font-medium"
              >
                {t("buttons.add")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("goals.list")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">
                  {t("goals.name")}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.target")}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.current")}
                </th>
                <th className="text-left p-3 font-semibold">
                  {t("goals.due_date")}
                </th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-right p-3 font-semibold">
                  {t("transactions.actions")}
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
              ) : goals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center">
                    {t("goals.no_goals")}
                  </td>
                </tr>
              ) : (
                goals.map((g, index) => {
                  const key = g.id ?? `goal-${index}`;
                  const progress =
                    g.target_amount > 0
                      ? ((Number(g.current_amount) || 0) /
                          Number(g.target_amount)) *
                        100
                      : 0;

                  return (
                    <tr
                      key={key}
                      className="border-t border-slate-100 dark:border-gray-700"
                    >
                      <td className="p-3">{g.name}</td>
                      <td className="p-3">{money(g.target_amount)}</td>
                      <td className="p-3">
                        {money(g.current_amount)}{" "}
                        <span className="text-xs text-slate-500 dark:text-gray-400">
                          ({progress.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-3">{fmtDate(g.deadline)}</td>
                      <td className="p-3 capitalize">
                        {g.status || "em progresso"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditTarget(g)}
                            className="text-violet-600 dark:text-violet-400 hover:underline text-xs sm:text-sm"
                          >
                            Ajustar objetivo
                          </button>

                          {g.status !== "cancelada" && (
                            <button
                              onClick={() => handleCancel(g)}
                              className="text-amber-600 dark:text-amber-400 hover:underline text-xs sm:text-sm"
                            >
                              Cancelar
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(g)}
                            className="text-red-600 dark:text-red-400 hover:underline text-xs sm:text-sm"
                          >
                            {t("buttons.delete")}
                          </button>
                        </div>
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
