import React, { useEffect, useState } from "react";
import Shell from "../../Layouts/Shell";
import { api } from "../../bootstrap";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

export default function Categories() {
  const { t } = useTranslation();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", type: "entrada" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", type: "entrada" });

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/categories");
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
      Swal.fire(t("alerts.warning"), t("categories.new"), "warning");
      return;
    }
    await api("/api/categories", {
      method: "POST",
      body: form,
    });
    setForm({ name: "", type: "entrada" });
    Swal.fire(t("alerts.success"), t("alerts.saved"), "success");
    await load();
  }

  async function saveEdit(id) {
    if (!editData.name.trim()) return;
    await api(`/api/categories/${id}`, {
      method: "PUT",
      body: editData,
    });
    setEditingId(null);
    setEditData({ name: "", type: "entrada" });
    Swal.fire(t("alerts.success"), t("alerts.updated"), "success");
    await load();
  }

  async function remove(id) {
    const result = await Swal.fire({
      title: t("alerts.confirm_delete"),
      text: t("categories.title"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
    });

    if (!result.isConfirmed) return;

    await api(`/api/categories/${id}`, { method: "DELETE" });
    Swal.fire(t("alerts.success"), t("alerts.deleted"), "success");
    await load();
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
        {t("categories.title")}
      </h1>

      {/* Nova categoria */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 p-4 mb-6 transition-colors duration-300">
        <h2 className="font-semibold mb-3 text-slate-900 dark:text-white">
          {t("categories.new")}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("categories.add")}
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 flex-1 min-w-[180px] transition-colors duration-300"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 transition-colors duration-300"
          >
            <option value="entrada">{t("transactions.income")}</option>
            <option value="saida">{t("transactions.expense")}</option>
          </select>
          <button
            onClick={create}
            className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition"
          >
            {t("buttons.add")}
          </button>
        </div>
      </div>

      {/* Lista de categorias */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("categories.list")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">{t("account.name")}</th>
                <th className="text-left p-3 font-semibold">{t("categories.type")}</th>
                <th className="text-right p-3 font-semibold">{t("transactions.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center">
                    {t("transactions.loading")}
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-6 text-center">
                    {t("categories.no_categories")}
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-slate-100 dark:border-gray-700 transition-colors duration-300"
                  >
                    <td className="p-3">
                      {editingId === c.id ? (
                        <input
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                     text-slate-900 dark:text-gray-100 rounded p-1 w-full transition-colors duration-300"
                        />
                      ) : (
                        c.name
                      )}
                    </td>
                    <td className="p-3 capitalize">
                      {editingId === c.id ? (
                        <select
                          value={editData.type}
                          onChange={(e) =>
                            setEditData({ ...editData, type: e.target.value })
                          }
                          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                     text-slate-900 dark:text-gray-100 rounded p-1 transition-colors duration-300"
                        >
                          <option value="entrada">{t("transactions.income")}</option>
                          <option value="saida">{t("transactions.expense")}</option>
                        </select>
                      ) : (
                        t(`transactions.${c.type === "entrada" ? "income" : "expense"}`)
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingId === c.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => saveEdit(c.id)}
                            className="text-green-600 hover:underline"
                          >
                            {t("buttons.save")}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData({ name: "", type: "entrada" });
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
                              setEditingId(c.id);
                              setEditData({ name: c.name, type: c.type });
                            }}
                            className="text-violet-600 hover:underline"
                          >
                            {t("buttons.edit")}
                          </button>
                          <button
                            onClick={() => remove(c.id)}
                            className="text-red-600 hover:underline"
                          >
                            {t("buttons.delete")}
                          </button>
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
