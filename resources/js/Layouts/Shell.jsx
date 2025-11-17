import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function itemClass(isActive) {
  return [
    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
    isActive
      ? "bg-violet-700 text-white"
      : "text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-800",
  ].join(" ");
}

function subItemClass(isActive) {
  return [
    "block px-3 py-2 rounded-lg text-sm transition-colors",
    isActive
      ? "bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200"
      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800",
  ].join(" ");
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

export default function Shell({ children }) {
  const location = useLocation();
  const isTxSectionActive = useMemo(
    () => location.pathname.startsWith("/transactions"),
    [location.pathname]
  );
  const [openTx, setOpenTx] = useState(isTxSectionActive);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const root = document.documentElement;
    if (savedTheme === "dark") {
      root.classList.add("dark");
      document.body.style.backgroundColor = "#0f172a";
    } else {
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#f9fafb";
    }

    const savedLocale = localStorage.getItem("locale") || "pt";
    if (typeof window.i18next !== "undefined") {
      window.i18next.changeLanguage(savedLocale);
    }
  }, []);

  useEffect(() => {
    setOpenTx(isTxSectionActive);
  }, [isTxSectionActive]);

  const handleLogout = async () => {
    const { background, color, confirmButtonColor, cancelButtonColor } = getSwalTheme();

    const confirm = await Swal.fire({
      title: "Deseja sair?",
      text: "Você será desconectado da sua conta.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
      background,
      color,
      confirmButtonColor,
      cancelButtonColor,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
      });

      if (res.ok) {
        const { background, color } = getSwalTheme();
        await Swal.fire({
          icon: "success",
          title: "Até logo!",
          text: "Você saiu da sua conta.",
          timer: 2000,
          showConfirmButton: false,
          background,
          color,
        });

        localStorage.removeItem("theme");
        localStorage.removeItem("locale");
        window.location.href = "/login";
      } else {
        const { background, color, confirmButtonColor } = getSwalTheme();
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível sair da conta.",
          background,
          color,
          confirmButtonColor,
        });
      }
    } catch (err) {
      console.error(err);
      const { background, color, confirmButtonColor } = getSwalTheme();
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Falha na comunicação com o servidor.",
        background,
        color,
        confirmButtonColor,
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <aside className="w-56 shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 p-5 flex flex-col transition-colors duration-500">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold mb-7 text-slate-900 dark:text-white"
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
              <div className="ml-3 pl-2 border-l border-slate-200 dark:border-gray-700 space-y-1 transition-all">
                <NavLink
                  to="/transactions"
                  end
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
                  to="/transactions/categories"
                  className={({ isActive }) => subItemClass(isActive)}
                >
                  Categorias
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

          {/* NOVO: Metas financeiras */}
          <NavLink
            to="/goals"
            className={({ isActive }) => itemClass(isActive)}
          >
            <span>🎯</span> <span>Metas</span>
          </NavLink>

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

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-all duration-300"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        {children}
      </main>
    </div>
  );
}
