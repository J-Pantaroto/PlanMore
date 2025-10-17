import React from "react";
import Shell from "../../Layouts/Shell";
import usePreferences from "../../hooks/usePreferences";

export default function Preferences() {
  const { prefs, updatePrefs, loading } = usePreferences();

  if (loading) return (
    <Shell>
      <div className="text-center py-20 text-slate-500">Carregando...</div>
    </Shell>
  );

  const toggle = (key) => updatePrefs({ [key]: !prefs[key] });

  return (
    <Shell>
      <div className="max-w-5xl p-8">
        <h1 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          Configurar Preferências
        </h1>

        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Idioma
          </label>
          <select
            value={prefs.language}
            onChange={(e) => updatePrefs({ language: e.target.value })}
            className="border border-slate-300 dark:border-slate-700 rounded-md p-2 w-48 text-sm dark:bg-slate-800 dark:text-white"
          >
            <option value="pt">Português</option>
            <option value="en">Inglês</option>
            <option value="es">Espanhol</option>
          </select>
        </div>

        <div className="mb-8">
          <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
            Notificações
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            <Switch
              label="Enviar notificações por email"
              checked={prefs.emailNotifications}
              onChange={() => toggle("emailNotifications")}
            />
            <Switch
              label="Notificar sobre atualizações"
              checked={prefs.updateNotifications}
              onChange={() => toggle("updateNotifications")}
            />
            <Switch
              label="Alertas de transações"
              checked={prefs.transactionAlerts}
              onChange={() => toggle("transactionAlerts")}
            />
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3 text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
            Tema
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                checked={prefs.theme === "light"}
                onChange={() => updatePrefs({ theme: "light" })}
              />
              <span className="text-slate-700 dark:text-slate-300">Claro</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="theme"
                checked={prefs.theme === "dark"}
                onChange={() => updatePrefs({ theme: "dark" })}
              />
              <span className="text-slate-700 dark:text-slate-300">Escuro</span>
            </label>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={onChange}
        className={`w-9 h-5 rounded-full transition-colors duration-200 ${
          checked ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"
        } relative`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : ""
          }`}
        ></div>
      </div>
      <span className="text-slate-700 dark:text-slate-300 text-sm">{label}</span>
    </label>
  );
}
