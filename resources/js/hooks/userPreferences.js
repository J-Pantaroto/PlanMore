import { useState, useEffect } from "react";
import i18n from "../../i18n/config";

/**
 * Hook central de preferências do usuário (versão fetch + Sanctum)
 * - Sincroniza com o backend (/api/user/preferences)
 * - Persiste localmente (localStorage)
 * - Aplica o tema manualmente com Tailwind darkMode: 'class'
 * - Corrige erro 419 (token CSRF) enviando cabeçalho X-XSRF-TOKEN
 */

export default function usePreferences() {
  const [prefs, setPrefs] = useState({
    theme: "light",
    language: "pt",
    emailNotifications: false,
    updateNotifications: false,
    transactionAlerts: false,
  });
  const [loading, setLoading] = useState(true);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
      body.style.backgroundColor = "#0f172a";
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
      body.style.backgroundColor = "#f9fafb";
    }
  };

  /**
   * Faz requisições autenticadas com suporte CSRF do Sanctum
   */
  const fetchWithCsrf = async (url, options = {}) => {
    const BASE_URL = "http://localhost:8000";

    await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      credentials: "include",
    });

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    };
    const xsrfToken = getCookie("XSRF-TOKEN");

    return fetch(`${BASE_URL}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
      },
      ...options,
    });
  };

  /**
   * Carrega preferências ao iniciar
   */
  useEffect(() => {
    const local = localStorage.getItem("userPrefs");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setPrefs(parsed);
        applyTheme(parsed.theme);
      } catch {
        console.warn("Falha ao ler preferências locais");
      }
    }

    fetchWithCsrf("/api/user/preferences")
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar preferências");
        const data = await res.json();
        setPrefs(data);
        if (data.theme && data.theme !== prefs.theme) {
          applyTheme(data.theme);
        }
        applyTheme(data.theme);
        localStorage.setItem("userPrefs", JSON.stringify(data));
      })
      .catch(() => {
        console.warn("Sem conexão com backend — usando preferências locais");
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Atualiza preferências no estado, localStorage e backend
   */

  const updatePrefs = async (newPrefs) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    applyTheme(updated.theme);
    localStorage.setItem("userPrefs", JSON.stringify(updated));

    if (newPrefs.language && newPrefs.language !== i18n.language) {
      i18n.changeLanguage(newPrefs.language);
      localStorage.setItem("language", newPrefs.language);
    }

    try {
      const res = await fetchWithCsrf("/api/user/preferences", {
        method: "PUT",
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Falha ao salvar preferências");
    } catch (err) {
      console.error("Erro ao salvar preferências no backend:", err);
    }
  };


 
  const resetPrefs = async () => {
    const defaults = {
      theme: "light",
      language: "pt",
      emailNotifications: false,
      updateNotifications: false,
      transactionAlerts: false,
    };
    setPrefs(defaults);
    applyTheme(defaults.theme);
    localStorage.setItem("userPrefs", JSON.stringify(defaults));

    try {
      const res = await fetchWithCsrf("/api/user/preferences", {
        method: "PUT",
        body: JSON.stringify(defaults),
      });
      if (!res.ok) throw new Error("Falha ao restaurar preferências");
    } catch (err) {
      console.error("Erro ao restaurar preferências:", err);
    }
  };

  return { prefs, updatePrefs, resetPrefs, loading };
}
