import React, { useEffect, useRef } from "react";
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
  LineController
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

  useEffect(() => {
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
        datasets: [
          {
            label: "Receita",
            data: [1000, 2000, 2200, 2700, 2400, 2300, 3000, 3100, 2800, 3200, 3500, 3400],
            borderColor: "#6C2BD9",
            backgroundColor: "transparent",
            tension: 0.4,
            pointBackgroundColor: "#6C2BD9",
          },
          {
            label: "Despesa",
            data: [500, 1400, 1800, 1900, 1500, 1000, 2000, 2200, 1900, 2400, 2600, 2700],
            borderColor: "#00CFE8",
            backgroundColor: "transparent",
            tension: 0.4,
            pointBackgroundColor: "#00CFE8",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true, position: "top" } },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Saldo</h3>
          <p className="text-2xl font-bold mt-2">R$ 12.500</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Receita Este Mês</h3>
          <p className="text-2xl font-bold mt-2">R$ 4.500</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Despesa Este Mês</h3>
          <p className="text-2xl font-bold mt-2">R$ 3.200</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow col-span-2">
          <h4 className="text-lg font-semibold mb-4">Resumo de Receitas e Despesas</h4>
          <canvas ref={chartRef} height="150"></canvas>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Transações Recentes</h4>
          <ul className="space-y-2">
            <li className="flex justify-between text-sm">Pagamento de sala <span className="text-red-500">−R$ 800</span></li>
            <li className="flex justify-between text-sm">Salário <span className="text-green-500">+R$ 3.000</span></li>
            <li className="flex justify-between text-sm">Compra online <span className="text-red-500">−R$ 120</span></li>
          </ul>

          <h4 className="text-lg font-semibold mt-6 mb-4">Categorias</h4>
          <ul className="space-y-2">
            <li className="flex justify-between text-sm">Alimentação <span>R$ 1.200</span></li>
            <li className="flex justify-between text-sm">Transporte <span>R$ 800</span></li>
            <li className="flex justify-between text-sm">Moradia <span>R$ 1.500</span></li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
