import React, { useEffect, useRef, useState } from "react";
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

export default function Dashboard() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { t } = useTranslation();

  const [saldo, setSaldo] = useState(0);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const response = await fetch("/api/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Erro ao carregar dados");
        const data = await response.json();

        const totalEntradas = Number(data.total_entradas) || 0;
        const totalSaidas = Number(data.total_saidas) || 0;

        setSaldo(Number(data.saldo_atual) || 0);
        setEntradas(totalEntradas);
        setSaidas(totalSaidas);
        setCategorias(data.categorias || []);

        if (chartInstance.current) chartInstance.current.destroy();

        const ctx = chartRef.current.getContext("2d");
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: [
              t("months.january"),
              t("months.february"),
              t("months.march"),
              t("months.april"),
              t("months.may")
            ],
            datasets: [
              {
                label: t("dashboard.income"),
                data: [
                  totalEntradas,
                  totalEntradas * 0.8,
                  totalEntradas * 0.6,
                  totalEntradas * 1.2,
                  totalEntradas
                ],
                borderColor: "#22c55e",
                backgroundColor: "transparent",
                tension: 0.4,
                pointBackgroundColor: "#22c55e",
              },
              {
                label: t("dashboard.expense"),
                data: [
                  totalSaidas,
                  totalSaidas * 1.1,
                  totalSaidas * 0.9,
                  totalSaidas * 1.3,
                  totalSaidas
                ],
                borderColor: "#ef4444",
                backgroundColor: "transparent",
                tension: 0.4,
                pointBackgroundColor: "#ef4444",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                labels: {
                  color: "#cbd5e1",
                },
              },
            },
            scales: {
              x: {
                ticks: { color: "#94a3b8" },
                grid: { color: "rgba(148,163,184,0.1)" },
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#94a3b8" },
                grid: { color: "rgba(148,163,184,0.1)" },
              },
            },
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    carregarDados();
  }, [t]); // 🔹 Atualiza o gráfico ao trocar idioma

  const fmtValor = (n) =>
    (Number(n) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
        {t("dashboard.title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.balance")}
          </h3>
          <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
            {fmtValor(saldo)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.income")}
          </h3>
          <p className="text-2xl font-bold mt-2 text-green-500">
            {fmtValor(entradas)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors duration-300">
          <h3 className="text-gray-500 dark:text-gray-300 text-sm">
            {t("dashboard.expense")}
          </h3>
          <p className="text-2xl font-bold mt-2 text-red-500">
            {fmtValor(saidas)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
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
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow col-span-2 transition-colors duration-300">
          <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {t("dashboard.summary")}
          </h4>
          <canvas ref={chartRef} height="150"></canvas>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow transition-colors duration-300">
          <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
            {t("dashboard.categories")}
          </h4>
          <ul className="space-y-2">
            {categorias.length > 0 ? (
              categorias.map((cat, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm text-gray-700 dark:text-gray-200"
                >
                  {cat.categoria || t("transactions.no_records")}
                  <span>{fmtValor(cat.total)}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("transactions.no_records")}
              </p>
            )}
          </ul>
        </div>
      </div>
    </Shell>
  );
}
