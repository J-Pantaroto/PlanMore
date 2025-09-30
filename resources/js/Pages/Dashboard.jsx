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

        setSaldo(Number(data.saldo_atual) || 0);
        setEntradas(Number(data.total_entradas) || 0);
        setSaidas(Number(data.total_saidas) || 0);
        setCategorias(data.categorias || []);

        // Montar gráfico
        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = chartRef.current.getContext("2d");
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Entradas", "Saídas"],
            datasets: [
              {
                label: "Valores",
                data: [Number(data.total_entradas), Number(data.total_saidas)],
                borderColor: "#6C2BD9",
                backgroundColor: "transparent",
                tension: 0.4,
                pointBackgroundColor: "#6C2BD9",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true, position: "top" } },
            scales: { y: { beginAtZero: true } },
          },
        });
      } catch (error) {
        console.error(error);
      }
    }

    carregarDados();
  }, []);

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Saldo</h3>
          <p className="text-2xl font-bold mt-2">
            R$ {saldo.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Receita Total</h3>
          <p className="text-2xl font-bold mt-2">
            R$ {entradas.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Despesa Total</h3>
          <p className="text-2xl font-bold mt-2">
            R$ {saidas.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-4 mb-6">
          <a
            href="/api/export/excel"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📊 Exportar Excel
          </a>

          <a
            href="/api/export/pdf"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            📄 Exportar PDF
          </a>
      </div>

      </div>

      {/* Gráfico + Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow col-span-2">
          <h4 className="text-lg font-semibold mb-4">
            Resumo de Receitas e Despesas
          </h4>
          <canvas ref={chartRef} height="150"></canvas>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Categorias</h4>
          <ul className="space-y-2">
            {categorias.length > 0 ? (
              categorias.map((cat, i) => (
                <li key={i} className="flex justify-between text-sm">
                  {cat.categoria || "Sem categoria"}{" "}
                  <span>R$ {Number(cat.total).toFixed(2)}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma categoria registrada.</p>
            )}
          </ul>
        </div>
      </div>
    </Shell>
  );
}
