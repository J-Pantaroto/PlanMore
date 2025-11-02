import React, { useEffect, useMemo, useRef, useState } from "react";
import Shell from "../Layouts/Shell";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { useTranslation } from "react-i18next";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineController
);

const toISO = (d) => d.toISOString().slice(0, 10);
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0);


function HelpTip({ title, children }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <span className="relative inline-flex items-center group">
      <button
        type="button"
        aria-describedby={id}
        aria-label={title}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="ml-1 w-4 h-4 rounded-full text-xs flex items-center justify-center
                   bg-slate-300/40 dark:bg-slate-600/40 text-slate-700 dark:text-slate-200
                   hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition
                   focus:outline-none focus:ring-2 focus:ring-slate-400/40"
      >
        ?
      </button>

      {/* Tooltip */}
      <div
        id={id}
        role="tooltip"
        className={`absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-64 max-w-[75vw]
                    rounded-lg border border-slate-200 dark:border-slate-700
                    bg-white/95 dark:bg-slate-800/95 shadow-lg p-3 text-xs
                    text-slate-700 dark:text-slate-200
                    ${open ? "opacity-100 visible" : "invisible opacity-0"}
                    group-hover:visible group-hover:opacity-100
                    transition-opacity`}
      >
        {children}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2
                        rotate-45 bg-white dark:bg-slate-800
                        border-l border-t border-slate-200 dark:border-slate-700" />
      </div>
    </span>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [filters, setFilters] = useState(() => ({
    from: toISO(startOfMonth(new Date())),
    to: toISO(endOfMonth(new Date())),
    type: "",
  }));

  const applyPreset = (preset) => {
    const today = new Date();
    let from = startOfMonth(today);
    let to = endOfMonth(today);

    if (preset === "ultimos-30") {
      to = today;
      const f = new Date();
      f.setDate(to.getDate() - 29);
      from = f;
    }
    if (preset === "ytd") {
      from = new Date(today.getFullYear(), 0, 1);
      to = today;
    }
    if (preset === "esta-semana") {
      const dow = today.getDay();
      const delta = (dow + 6) % 7;
      from = new Date(today);
      from.setDate(today.getDate() - delta);
      to = today;
    }

    setFilters((f) => ({ ...f, from: toISO(from), to: toISO(to) }));
  };

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [saldoAtual, setSaldoAtual] = useState(0);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [entradasPeriodo, setEntradasPeriodo] = useState(0);
  const [saidasPeriodo, setSaidasPeriodo] = useState(0);
  const [saldoPeriodo, setSaldoPeriodo] = useState(0);

  const [burnRateDia, setBurnRateDia] = useState(0);
  const [runwayDias, setRunwayDias] = useState(null);

  const [parcelasInfo, setParcelasInfo] = useState({ qtd: 0, valor: 0 });
  const [topCategorias, setTopCategorias] = useState([]);

  const [serieDiaria, setSerieDiaria] = useState([]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const qs = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
          )
        ).toString();

        const response = await fetch(`/api/dashboard?${qs}`, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Erro ao carregar dados do dashboard");
        const data = await response.json();
        if (ignore) return;

        setSaldoAtual(Number(data.saldo_atual) || 0);
        setSaldoInicial(Number(data.saldo_inicial) || 0);
        setEntradasPeriodo(Number(data.entradas_periodo) || 0);
        setSaidasPeriodo(Number(data.saidas_periodo) || 0);
        setSaldoPeriodo(Number(data.saldo_periodo) || 0);

        setBurnRateDia(Number(data.burn_rate_dia) || 0);
        setRunwayDias(data.runway_dias ?? null);

        const parc = data.parcelas || { qtd: 0, valor: 0 };
        setParcelasInfo({ qtd: Number(parc.qtd) || 0, valor: Number(parc.valor) || 0 });

        setTopCategorias(Array.isArray(data.top_categorias) ? data.top_categorias : []);
        setSerieDiaria(Array.isArray(data.serie_diaria) ? data.serie_diaria : []);

      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => (ignore = true);
  }, [filters, t]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const labels = serieDiaria.map((d) => d.date);
    const entradasDs = serieDiaria.map((d) => Number(d.entradas) || 0);
    const saidasDs = serieDiaria.map((d) => Number(d["saídas"]) || Number(d.saidas) || 0);

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t("dashboard.income"),
            data: entradasDs,
            borderColor: "#22c55e",
            backgroundColor: "transparent",
            tension: 0.35,
            pointBackgroundColor: "#22c55e",
          },
          {
            label: t("dashboard.expense"),
            data: saidasDs,
            borderColor: "#ef4444",
            backgroundColor: "transparent",
            tension: 0.35,
            pointBackgroundColor: "#ef4444",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#cbd5e1" },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8" },
            grid: { color: "rgba(148,163,184,0.1)" },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#94a3b8",
              callback: (v) =>
                (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            },
            grid: { color: "rgba(148,163,184,0.1)" },
          },
        },
      },
    });
  }, [serieDiaria, t]);

  const fmtValor = (n) =>
    (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const saldoPeriodoColor =
    saldoPeriodo > 0 ? "text-green-500" : saldoPeriodo < 0 ? "text-red-500" : "text-slate-900 dark:text-white";

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {t("dashboard.title")}
      </h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("common.from") || "De"}
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("common.to") || "Até"}
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t("transactions.type") || "Tipo"}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-gray-200 dark:border-gray-700"
              >
                <option value="">{t("common.all") || "Todos"}</option>
                <option value="entrada">{t("dashboard.income")}</option>
                <option value="saida">{t("dashboard.expense")}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset("este-mes")}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-white text-sm"
            >
              {t("presets.this_month") || "Este mês"}
            </button>
            <button
              onClick={() => applyPreset("ultimos-30")}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-white text-sm"
            >
              {t("presets.last_30_days") || "Últimos 30 dias"}
            </button>
            <button
              onClick={() => applyPreset("esta-semana")}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-white text-sm"
            >
              {t("presets.this_week") || "Esta semana"}
            </button>
            <button
              onClick={() => applyPreset("ytd")}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-800 dark:text-white text-sm"
            >
              {t("presets.ytd") || "Ano (YTD)"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 text-sm text-red-500">
            {t("common.error") || "Erro:"} {String(err)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.opening_balance") || "Saldo inicial do período"}
          </h3>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {fmtValor(saldoInicial)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">{t("dashboard.income")}</h3>
          <p className="text-2xl font-bold mt-1 text-green-500">{fmtValor(entradasPeriodo)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">{t("dashboard.expense")}</h3>
          <p className="text-2xl font-bold mt-1 text-red-500">{fmtValor(saidasPeriodo)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.period_balance") || "Saldo do período"}
          </h3>
          <p className={`text-2xl font-bold mt-1 ${saldoPeriodoColor}`}>{fmtValor(saldoPeriodo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm flex items-center">
            {t("dashboard.burn_rate") || "Burn rate (por dia)"}
            <HelpTip title={t("help.more_info")}>
              <span className="font-semibold block mb-1">{t("dashboard.burn_rate")}</span>
              <span className="block">{t("help.burn_rate")}</span>
            </HelpTip>
          </h3>
          <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">
            {fmtValor(burnRateDia)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm flex items-center">
            {t("dashboard.runway_days") || "Runway (dias)"}
            <HelpTip title={t("help.more_info")}>
              <span className="font-semibold block mb-1">{t("dashboard.runway_days")}</span>
              <span className="block">{t("help.runway")}</span>
            </HelpTip>
          </h3>
          <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">
            {runwayDias === null ? "-" : runwayDias}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.installments") || "Parcelas (no período)"}
          </h3>
          <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">
            {parcelasInfo.qtd} {t("common.count") || "itens"} · {fmtValor(parcelasInfo.valor)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href="/api/export/excel"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
        >
          {t("dashboard.export_excel")}
        </a>
        <a
          href="/api/export/pdf"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          {t("dashboard.export_pdf")}
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("dashboard.summary")}
            </h4>
            {loading && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t("common.loading") || "Carregando..."}
              </span>
            )}
          </div>
          <canvas ref={chartRef} height="150" />
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors">
          <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {t("dashboard.categories")} — {t("dashboard.expense")}
          </h4>
          <ul className="space-y-2">
            {topCategorias && topCategorias.length > 0 ? (
              topCategorias.map((cat, i) => (
                <li
                  key={`${cat.categoria}-${i}`}
                  className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200"
                >
                  <span className="truncate">{cat.categoria || t("transactions.no_records")}</span>
                  <span className="font-semibold">{fmtValor(cat.total)}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("transactions.no_records")}
              </p>
            )}
          </ul>

          <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              {t("dashboard.balance") || "Saldo atual"}
            </h5>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {fmtValor(saldoAtual)}
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
