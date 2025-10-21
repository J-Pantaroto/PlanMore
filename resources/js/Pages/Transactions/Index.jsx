import React, { useEffect, useMemo, useState, useCallback } from "react";
import Shell from "../../Layouts/Shell";
import { api } from "../../bootstrap";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const money = (n) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (s) => {
  if (!s) return "-";
  const date = new Date(s);
  if (isNaN(date)) return s;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
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

export default function TransactionsIndex() {
  const { t } = useTranslation();

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
  const [openModal, setOpenModal] = useState(false);

  const [modalForm, setModalForm] = useState({
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
    if (!modalForm.category_id) {
      Swal.fire(t("alerts.warning"), t("transactions.category"), "warning");
      return;
    }
    if (!modalForm.valor || Number(modalForm.valor) <= 0) {
      Swal.fire(t("alerts.warning"), t("transactions.value"), "warning");
      return;
    }

    try {
      const apiPayload = {
        type: modalForm.tipo === "Receita" ? "entrada" : "saida",
        amount: Number(String(modalForm.valor).replace(",", ".")),
        category_id: modalForm.category_id || null,
        group_id: modalForm.group_id || null,
        description: modalForm.observacao || "",
        date: String(modalForm.datetime).slice(0, 10),
        is_installment: !!modalForm.parcelado,
        installments: modalForm.parcelado ? Number(modalForm.parcelas || 1) : undefined,
        is_recurring: !!modalForm.recorrente,
        recurrence_interval: modalForm.recorrente ? modalForm.intervalo : undefined,
        recurrence_end_date: modalForm.recorrente ? (modalForm.fim || undefined) : undefined,
      };

      await api("/api/transactions", { method: "POST", body: apiPayload });
      Swal.fire(t("alerts.success"), t("alerts.saved"), "success");

      setOpenModal(false);
      resetModal();
      setPage(1);
      await fetchAll();
    } catch (e) {
      Swal.fire(t("alerts.error"), e?.message || t("alerts.error"), "error");
    }
  }

  const amountClass = (row) =>
    [
      "font-semibold",
      row.type === "entrada" ? "text-green-500" : "text-red-500",
      "tabular-nums",
    ].join(" ");

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white transition-colors duration-300">
        {t("transactions.manage")}
      </h1>

      <div className="mb-6">
        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-violet-800 transition"
        >
          {t("transactions.new")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 transition-colors duration-300">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg p-2"
        >
          <option value="">{t("transactions.type")}</option>
          <option value="entrada">{t("transactions.income")}</option>
          <option value="saida">{t("transactions.expense")}</option>
        </select>

        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg p-2"
        >
          <option value="">{t("transactions.category")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filters.group_id}
          onChange={(e) => setFilters({ ...filters, group_id: e.target.value })}
          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg p-2"
        >
          <option value="">{t("transactions.group")}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <input
          type="month"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg p-2"
        />

        <input
          placeholder={t("transactions.search_description")}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 rounded-lg p-2 md:col-span-2"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow ring-1 ring-slate-200 dark:ring-gray-700 transition-colors duration-300">
        <div className="p-4 pb-0">
          <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">
            {t("transactions.recent")}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 transition-colors duration-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200">
                <th className="text-left p-3 font-semibold">{t("transactions.date")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.description")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.category")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.group")}</th>
                <th className="text-right p-3 font-semibold">{t("transactions.value")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.parcel")}</th>
                <th className="text-left p-3 font-semibold">{t("transactions.recurring")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-6 text-center">{t("transactions.loading")}</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center">{t("transactions.no_records")}</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 dark:border-gray-700">
                    <td className="p-3">{fmtDate(row.date)}</td>
                    <td className="p-3">{row.description || "-"}</td>
                    <td className="p-3">{categories.find((c) => c.id === row.category_id)?.name || "-"}</td>
                    <td className="p-3">{groups.find((g) => g.id === row.group_id)?.name || "-"}</td>
                    <td className={`p-3 text-right ${amountClass(row)}`}>
                      {row.type === "saida" ? "−" : ""}
                      {money(row.amount)}
                    </td>
                    <td className="p-3">{row.is_installment ? `${row.installment_number}/${row.installments}` : "-"}</td>
                    <td className="p-3">{row.is_recurring ? "Sim" : "Não"}</td>
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
