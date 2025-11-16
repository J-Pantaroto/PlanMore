import React, { useEffect, useState } from "react";
import Shell from "@/Layouts/Shell";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { api } from "@/bootstrap";
import PrimaryButton from "@/Components/PrimaryButton";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="
          relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto
          bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-gray-700
          flex flex-col transition-colors duration-300
        "
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3 text-slate-800 dark:text-gray-100">{children}</div>
      </div>
    </div>
  );
}

function getSwalTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  return {
    background: isDark ? "#020617" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
  };
}

export default function Automation() {
  const { t } = useTranslation();

  const [rules, setRules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [form, setForm] = useState({
    id: null,
    rule_type: "classification",
    name: "",
    match_text: "",
    actions: {
      type: "entrada",
      set_category: "",
      set_group: "",
      goal_id: "",
      goal_percent: "",
      goal_fixed: "",
    },
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesRes, goalsRes] = await Promise.all([
          api("/api/automation-rules"),
          api("/api/goals"),
        ]);
        setRules(Array.isArray(rulesRes) ? rulesRes : []);
        setGoals(Array.isArray(goalsRes) ? goalsRes : []);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!openModal) return;
    const loadLists = async () => {
      try {
        const [cats, grps] = await Promise.all([
          api("/api/categories"),
          api("/api/groups"),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setGroups(Array.isArray(grps) ? grps : []);
      } catch (e) {
        console.error("Erro ao carregar listas:", e);
      }
    };
    loadLists();
  }, [openModal]);

  const resetForm = () => {
    setForm({
      id: null,
      rule_type: "classification",
      name: "",
      match_text: "",
      actions: {
        type: "entrada",
        set_category: "",
        set_group: "",
        goal_id: "",
        goal_percent: "",
        goal_fixed: "",
      },
      is_active: true,
    });
  };

  const saveRule = async () => {
    if (!form.name.trim()) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: "Insira um nome para a regra",
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const url = form.id
      ? `/api/automation-rules/${form.id}`
      : `/api/automation-rules`;

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
        body: JSON.stringify({
          name: form.name,
          match_text: form.match_text,
          rule_type: form.rule_type,
          actions: form.actions,
          is_active: form.is_active,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar regra");
      const data = await res.json();

      setRules((prev) =>
        form.id ? prev.map((r) => (r.id === form.id ? data : r)) : [...prev, data]
      );

      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: t("alerts.saved"),
        background,
        color,
        confirmButtonColor,
      });

      setOpenModal(false);
      resetForm();
    } catch (e) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e.message,
        background,
        color,
        confirmButtonColor,
      });
    }
  };

  const editRule = (r) => {
    setForm({
      id: r.id,
      rule_type: r.rule_type || "classification",
      name: r.name,
      match_text: r.match_text,
      actions: r.actions || {},
      is_active: r.is_active,
    });
    setOpenModal(true);
  };

  const deleteRule = async (id) => {
    const { background, color, confirmButtonColor, cancelButtonColor } = getSwalTheme();

    const confirm = await Swal.fire({
      title: t("alerts.confirm_delete"),
      icon: "warning",
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
      await fetch(`/api/automation-rules/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
      });
      setRules((prev) => prev.filter((r) => r.id !== id));

      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "success",
        title: t("alerts.success"),
        text: t("alerts.deleted"),
        background,
        color,
        confirmButtonColor,
      });
    } catch (e) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "error",
        title: t("alerts.error"),
        text: e.message,
        background,
        color,
        confirmButtonColor,
      });
    }
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("automation.title")}
          </h1>
          <button class="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition" onClick={() => setOpenModal(true)}>
            {t("automation.new_rule")}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 dark:text-gray-400 py-6">
            {t("transactions.loading")}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-gray-400 py-6">
            {t("automation.no_rules")}
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-start border rounded-lg p-4 dark:border-gray-700"
              >
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-white">
                    {r.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    {t("automation.condition")}:{" "}
                    <span className="font-medium">
                      “{r.match_text || t("transactions.description")}”
                    </span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    Tipo:{" "}
                    {r.rule_type === "goal"
                      ? "Meta"
                      : "Classificação automática"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => editRule(r)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    {t("buttons.edit")}
                  </button>
                  <button
                    onClick={() => deleteRule(r.id)}
                    className="text-red-600 dark:text-red-400 hover:underline text-sm"
                  >
                    {t("buttons.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={form.id ? t("buttons.edit") : t("automation.new_rule")}
      >
        <div className="space-y-3 text-slate-800 dark:text-gray-100">
          <div>
            <label className="block mb-1 font-medium">Tipo de regra</label>
            <select
              value={form.rule_type || "classification"}
              onChange={(e) =>
                setForm({ ...form, rule_type: e.target.value })
              }
              className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
            >
              <option value="classification">Classificação automática</option>
              <option value="goal">Vincular a meta</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">
              {t("automation.rule_name")}
            </label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              {t("automation.condition")}
            </label>
            <input
              type="text"
              value={form.match_text || ""}
              onChange={(e) =>
                setForm({ ...form, match_text: e.target.value })
              }
              className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
              placeholder="Ex: salário, uber, mercado..."
            />
          </div>

          {form.rule_type === "classification" && (
            <>
              <div>
                <label className="block mb-1 font-medium">
                  {t("transactions.type")}
                </label>
                <select
                  value={form.actions.type || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: { ...form.actions, type: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                >
                  <option value="entrada">
                    {t("transactions.income")}
                  </option>
                  <option value="saida">
                    {t("transactions.expense")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {t("transactions.category")}
                </label>
                <select
                  value={form.actions.set_category || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: {
                        ...form.actions,
                        set_category: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                >
                  <option value="">
                    {t("categories.title") || "Selecione"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {t("transactions.group")} (opcional)
                </label>
                <select
                  value={form.actions.set_group || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: {
                        ...form.actions,
                        set_group: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                >
                  <option value="">
                    {t("groups.title") || "Selecione"}
                  </option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {form.rule_type === "goal" && (
            <>
              <div>
                <label className="block mb-1 font-medium">Meta</label>
                <select
                  value={form.actions.goal_id || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: { ...form.actions, goal_id: e.target.value },
                    })
                  }
                  className="w-full border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                >
                  <option value="">
                    {t("automation.goal") || "Selecione"}
                  </option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="%"
                  value={form.actions.goal_percent || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: {
                        ...form.actions,
                        goal_percent: e.target.value,
                      },
                    })
                  }
                  className="border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                />
                <input
                  type="number"
                  placeholder="R$"
                  value={form.actions.goal_fixed || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      actions: {
                        ...form.actions,
                        goal_fixed: e.target.value,
                      },
                    })
                  }
                  className="border border-slate-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-slate-300 dark:hover:bg-gray-600"
            >
              {t("buttons.cancel")}
            </button>
            <button
              onClick={saveRule}
              className="px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-800 text-white"
            >
              {t("buttons.save")}
            </button>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
