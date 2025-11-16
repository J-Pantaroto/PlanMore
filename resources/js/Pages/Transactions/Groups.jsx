import React, { useEffect, useState } from "react";
import Shell from "../../Layouts/Shell";
import { api } from "../../bootstrap";
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

export default function Groups() {
  const { t } = useTranslation();
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

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name.trim()) {
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text: t("groups.new"),
        background,
        color,
        confirmButtonColor,
      });
      return;
    }

    await api("/api/groups", { method: "POST", body: { name } });
    setName("");

    const { background, color, confirmButtonColor } = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.saved"),
      background,
      color,
      confirmButtonColor,
    });

    await load();
  }

  async function saveEdit(id) {
    if (!editName.trim()) return;

    await api(`/api/groups/${id}`, { method: "PUT", body: { name: editName } });
    setEditingId(null);
    setEditName("");

    const { background, color, confirmButtonColor } = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.updated"),
      background,
      color,
      confirmButtonColor,
    });

    await load();
  }

  async function remove(id) {
    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    const result = await Swal.fire({
      title: t("alerts.confirm_delete"),
      text: t("groups.title"),
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

    await api(`/api/groups/${id}`, { method: "DELETE" });

    const theme = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.deleted"),
      background: theme.background,
      color: theme.color,
      confirmButtonColor: theme.confirmButtonColor,
    });

    await load();
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
        {t("groups.title")}
      </h1>

      {/* Novo grupo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 p-4 mb-6 transition-colors duration-300">
        <h2 className="font-semibold mb-3 text-slate-900 dark:text-white">
          {t("groups.new")}
        </h2>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("groups.add")}
            className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                       text-slate-900 dark:text-gray-100 rounded-lg p-2 flex-1 transition-colors duration-300"
          />
          <button
            onClick={create}
            className="px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition"
          >
            {t("buttons.add")}
          </button>
        </div>
      </div>

      {/* Lista de grupos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("groups.list")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">
                  {t("account.name")}
                </th>
                <th className="text-right p-3 font-semibold">
                  {t("transactions.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="p-6 text-center">
                    {t("transactions.loading")}
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="2" className="p-6 text-center">
                    {t("groups.no_groups")}
                  </td>
                </tr>
              ) : (
                list.map((g) => (
                  <tr
                    key={g.id}
                    className="border-t border-slate-100 dark:border-gray-700 transition-colors duration-300"
                  >
                    <td className="p-3">
                      {editingId === g.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                                     text-slate-900 dark:text-gray-100 rounded p-1 w-full transition-colors duration-300"
                        />
                      ) : (
                        g.name
                      )}
                    </td>
                    <td className="p-3 text-right">
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
                              setEditName("");
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
                              setEditName(g.name);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
