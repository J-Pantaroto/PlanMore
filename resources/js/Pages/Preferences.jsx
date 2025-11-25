// resources/js/Pages/Preferences.jsx
import React from "react";
import Swal from "sweetalert2";
import Shell from "../Layouts/Shell";
import usePreferences from "../hooks/userPreferences";
import { useTranslation } from "react-i18next";

function getSwalTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  return {
    background: isDark ? "#020617" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
  };
}

export default function Preferences() {
  const { t } = useTranslation();
  const { prefs, updatePrefs, resetPrefs, loading } = usePreferences();

  const [telegramChatIdInput, setTelegramChatIdInput] = React.useState("");

  React.useEffect(() => {
    setTelegramChatIdInput(prefs.telegramChatId || "");
  }, [prefs.telegramChatId]);

  if (loading)
    return (
      <Shell>
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {t("transactions.loading")}
        </div>
      </Shell>
    );

  const handleUpdate = async (newPrefs) => {
    await updatePrefs(newPrefs);

    const { background, color, confirmButtonColor } = getSwalTheme();
    Swal.fire({
      icon: "success",
      title: t("alerts.success"),
      text: t("alerts.saved"),
      confirmButtonColor,
      background,
      color,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleReset = () => {
    const { background, color, confirmButtonColor, cancelButtonColor } =
      getSwalTheme();

    Swal.fire({
      title: t("preferences.reset"),
      text: t("alerts.confirm_delete"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText: t("buttons.confirm"),
      cancelButtonText: t("buttons.cancel"),
      background,
      color,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await resetPrefs();

        const { background, color, confirmButtonColor } = getSwalTheme();
        Swal.fire({
          icon: "success",
          title: t("alerts.success"),
          text: t("alerts.updated"),
          confirmButtonColor,
          background,
          color,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const toggle = (key) => handleUpdate({ [key]: !prefs[key] });

  const handleSaveTelegramChatId = async () => {
    const { background, color, confirmButtonColor } = getSwalTheme();

    if (!telegramChatIdInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("alerts.warning"),
        text:
          t("preferences.telegram_chat_id") ||
          "Informe seu Telegram Chat ID para receber notificações.",
        confirmButtonColor,
        background,
        color,
      });
      return;
    }

    await handleUpdate({ telegramChatId: telegramChatIdInput.trim() });
  };

  return (
    <Shell>
      <div className="px-12 py-10 text-gray-900 dark:text-gray-100 min-h-screen">
        <h1 className="text-2xl font-extrabold mb-10 text-gray-900 dark:text-white">
          {t("preferences.title")}
        </h1>

        {/* Idioma */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">
            {t("preferences.language")}
          </h2>
          <select
            value={prefs.language}
            onChange={(e) => handleUpdate({ language: e.target.value })}
            className="border border-gray-400 dark:border-gray-600 rounded-md p-2 w-56 
                       text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-sm"
          >
            <option value="pt">
              {t("languages.pt") || "Português (Brasil)"}
            </option>
            <option value="en">{t("languages.en") || "English"}</option>
          </select>
        </section>

        {/* Notificações */}
        <section className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
            {t("preferences.notifications")}
          </h2>

          <div className="flex flex-col gap-4">
            {/* E-mail */}
            <Switch
              label={t("preferences.email_notifications")}
              checked={!!prefs.emailNotifications}
              onChange={() => toggle("emailNotifications")}
            />

            {/* Telegram */}
            <Switch
              label={
                t("preferences.telegram_notifications") ||
                "Notificações via Telegram"
              }
              checked={!!prefs.telegramEnabled}
              onChange={() => toggle("telegramEnabled")}
            />
          </div>

          {/* Bloco extra só quando Telegram está ativo */}
          {prefs.telegramEnabled && (
            <div className="mt-5 p-4 rounded-lg border border-purple-500/40 bg-purple-50/60 dark:bg-purple-950/20 dark:border-purple-400/40">
              <p className="text-sm text-gray-800 dark:text-gray-100 mb-2">
                {t("preferences.telegram_help_text") ||
                  "Informe seu Telegram Chat ID. Use o bot da PlanMore para obter esse código e cole aqui para receber notificações."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-2">
                <input
                  type="text"
                  value={telegramChatIdInput}
                  onChange={(e) => setTelegramChatIdInput(e.target.value)}
                  placeholder={
                    t("preferences.telegram_chat_id_placeholder") ||
                    "Ex: 123456789"
                  }
                  className="w-full sm:flex-1 border border-gray-400 dark:border-gray-600 rounded-md px-3 py-2 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleSaveTelegramChatId}
                  className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium 
                             hover:bg-purple-700 transition-all shadow-sm"
                >
                  {t("buttons.save")}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Tema */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
            {t("preferences.theme")}
          </h2>
          <div className="flex gap-4 text-base">
            <ThemeOption
              label={t("preferences.light")}
              selected={prefs.theme === "light"}
              onSelect={() => handleUpdate({ theme: "light" })}
            />
            <ThemeOption
              label={t("preferences.dark")}
              selected={prefs.theme === "dark"}
              onSelect={() => handleUpdate({ theme: "dark" })}
            />
          </div>
        </section>

        {/* Reset */}
        <div className="mt-12">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-md border border-gray-500 dark:border-gray-400
                       text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                       hover:text-purple-700 dark:hover:text-purple-400
                       transition-all duration-200"
          >
            {t("preferences.reset")}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer text-gray-800 dark:text-gray-200 hover:scale-[1.02] transition-transform">
      <div
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner ${
          checked ? "bg-purple-600" : "bg-gray-400 dark:bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
            checked ? "translate-x-5" : ""
          }`}
        ></div>
      </div>
      <span className="text-base font-medium">{label}</span>
    </label>
  );
}

function ThemeOption({ label, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center justify-center gap-2 px-5 py-2 rounded-md border text-base font-medium transition-all duration-300 ${
        selected
          ? "bg-purple-600 border-purple-700 text-white shadow-md scale-105"
          : "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-900 dark:text-gray-200 hover:border-purple-500"
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full ${
          selected ? "bg-white" : "bg-purple-500"
        }`}
      ></div>
      {label}
    </button>
  );
}
