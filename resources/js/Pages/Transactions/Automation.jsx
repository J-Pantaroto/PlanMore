import React, { useState } from "react";
import Shell from "../../Layouts/Shell";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export default function Automation() {
  const { t } = useTranslation();
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({
    name: "",
    contains: "",
    action: { set_category: "", set_group: "", mark_recurring: false },
  });

  function addRule() {
    if (!form.name.trim() || !form.contains.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: t("automation.condition"),
        confirmButtonColor: "#9333ea",
        background: "#1e1b4b",
        color: "#fff",
      });
      return;
    }
    const id = Math.random().toString(36).slice(2);
    setRules((r) => [...r, { id, ...form }]);
    setForm({
      name: "",
      contains: "",
      action: { set_category: "", set_group: "", mark_recurring: false },
    });
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("automation.new_rule") + " " + t("alerts.saved"),
      confirmButtonColor: "#9333ea",
      background: "#1e1b4b",
      color: "#fff",
      timer: 1200,
      showConfirmButton: false,
    });
  }

  function removeRule(id) {
    Swal.fire({
      title: t("alerts.confirm_delete"),
      text: t("automation.title"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9333ea",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
      background: "#1e1b4b",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        setRules((r) => r.filter((x) => x.id !== id));
        Swal.fire({
          icon: "success",
          title: t("alerts.success"),
          text: t("alerts.deleted"),
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
        {t("automation.title")}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 p-4 mb-6 transition-colors duration-300">
        <h2 className="font-semibold mb-3 text-slate-900 dark:text-white">
          {t("automation.new_rule")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            placeholder={t("automation.rule_name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            placeholder={t("automation.condition")}
            value={form.contains}
            onChange={(e) => setForm({ ...form, contains: e.target.value })}
          />

          <div className="flex items-center gap-3 text-slate-800 dark:text-gray-100 transition-colors duration-300">
            <input
              id="mark_recurring"
              type="checkbox"
              checked={form.action.mark_recurring}
              onChange={(e) =>
                setForm({
                  ...form,
                  action: {
                    ...form.action,
                    mark_recurring: e.target.checked,
                  },
                })
              }
            />
            <label htmlFor="mark_recurring">{t("automation.mark_recurring")}</label>
          </div>

          <input
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            placeholder={t("automation.set_category")}
            value={form.action.set_category}
            onChange={(e) =>
              setForm({
                ...form,
                action: { ...form.action, set_category: e.target.value },
              })
            }
          />

          <input
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
            placeholder={t("automation.set_group")}
            value={form.action.set_group}
            onChange={(e) =>
              setForm({
                ...form,
                action: { ...form.action, set_group: e.target.value },
              })
            }
          />

          <div className="flex items-center md:justify-end">
            <button
              onClick={addRule}
              className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition"
            >
              {t("automation.add_rule")}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-gray-400 mt-2">
          * {t("automation.note") ||
            "Em breve poderemos salvar essas regras no backend e aplicá-las ao criar/importar transações."}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("automation.active_rules")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 
                             text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">{t("account.name")}</th>
                <th className="text-left p-3 font-semibold">{t("automation.condition")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.actions")}</th>
                <th className="text-right p-3 font-semibold">{t("buttons.delete")}</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-6 text-center">
                    {t("automation.no_rules")}
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 dark:border-gray-700 transition-colors duration-300"
                  >
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">
                      {t("automation.condition")}:{" "}
                      <code className="bg-slate-100 dark:bg-gray-700 px-1 rounded">
                        {r.contains}
                      </code>
                    </td>
                    <td className="p-3">
                      {r.action.mark_recurring && (
                        <span className="mr-2 text-amber-600 dark:text-amber-400">
                          🔁 {t("automation.mark_recurring")}
                        </span>
                      )}
                      {r.action.set_category && (
                        <span className="mr-2 text-green-600 dark:text-green-400">
                          {t("transactions.category")}: {r.action.set_category}
                        </span>
                      )}
                      {r.action.set_group && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {t("transactions.group")}: {r.action.set_group}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => removeRule(r.id)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        {t("buttons.delete")}
                      </button>
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
