import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function itemClass(isActive) {
  return [
    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
    isActive ? "bg-violet-700 text-white" : "text-slate-900 hover:bg-slate-100",
  ].join(" ");
}

function subItemClass(isActive) {
  return [
    "block px-3 py-2 rounded-lg text-sm",
    isActive ? "bg-violet-50 text-violet-800" : "text-slate-700 hover:bg-slate-100",
  ].join(" ");
}

export default function Shell({ children }) {
  const location = useLocation();
  const isTxSectionActive = useMemo(
    () => location.pathname.startsWith("/transactions"),
    [location.pathname]
  );
  const [openTx, setOpenTx] = useState(isTxSectionActive);

  useEffect(() => {
    setOpenTx(isTxSectionActive);
  }, [isTxSectionActive]);

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "Deseja sair?",
      text: "Você será desconectado da sua conta.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
        },
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Até logo!",
          text: "Você saiu da sua conta.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/login";
        });
      } else {
        Swal.fire("Erro", "Não foi possível sair da conta.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Erro", "Falha na comunicação com o servidor.", "error");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold mb-7"
        >
          <img src="/favicon.ico" alt="" className="w-6 h-6" />
          <span>PlanMore</span>
        </Link>

        <nav className="space-y-2 flex-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => itemClass(isActive)}
          >
            <span>📊</span> <span>Dashboard</span>
          </NavLink>

          {/* Transações (colapsável) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenTx((v) => !v)}
              className={itemClass(isTxSectionActive)}
              aria-expanded={openTx}
            >
              <span>💰</span>
              <span className="flex-1 text-left">Transações</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  openTx ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>

            {openTx && (
              <div className="ml-3 pl-2 border-l border-slate-200 space-y-1">
                <NavLink
                  to="/transactions"
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Visão geral
                </NavLink>
                <NavLink
                  to="/transactions/groups"
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Grupos
                </NavLink>
                <NavLink
                  to="/transactions/automation"
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Automatização
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) => itemClass(isActive)}
          >
            <span>⚙️</span> <span>Preferências</span>
          </NavLink>
          <NavLink
            to="/profile/edit"
            className={({ isActive }) => itemClass(isActive)}
          >
            <span>👤</span> <span>Conta</span>
          </NavLink>
        </nav>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700"
        >
          Sair
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
