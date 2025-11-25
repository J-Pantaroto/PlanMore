import { useState, useEffect } from "react";
import i18n from "../../i18n/config";

const DEFAULT_PREFS = {
  theme: "light",
  language: "pt",
  emailNotifications: false,
  telegramEnabled: false,
  telegramChatId: "",
};

export default function usePreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;
    localStorage.setItem("theme", theme);
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

  useEffect(() => {
    const local = localStorage.getItem("userPrefs");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const merged = {
          ...DEFAULT_PREFS,
          ...parsed,
        };
        setPrefs(merged);
        applyTheme(merged.theme);
        if (merged.language && merged.language !== i18n.language) {
          i18n.changeLanguage(merged.language);
          localStorage.setItem("language", merged.language);
        }
      } catch {
        console.warn("Falha ao ler preferências locais");
      }
    }

    fetchWithCsrf("/api/user/preferences")
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao carregar preferências");
        const data = await res.json();

        const merged = {
          ...DEFAULT_PREFS,
          ...(data || {}),
        };

        setPrefs(merged);
        applyTheme(merged.theme);

        if (merged.language && merged.language !== i18n.language) {
          i18n.changeLanguage(merged.language);
          localStorage.setItem("language", merged.language);
        }

        localStorage.setItem("userPrefs", JSON.stringify(merged));
      })
      .catch(() => {
        console.warn("Sem conexão com backend — usando preferências locais");
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePrefs = async (newPrefs) => {
    const updated = {
      ...prefs,
      ...newPrefs,
    };

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
    const defaults = { ...DEFAULT_PREFS };

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
