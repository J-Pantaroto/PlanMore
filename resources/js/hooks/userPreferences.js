import { useEffect, useState } from "react";
import { api } from "../bootstrap";

/**
 * Hook que sincroniza preferências com o backend e localStorage
 */
export default function usePreferences() {
  const [prefs, setPrefs] = useState({
    theme: "light",
    language: "pt",
    emailNotifications: true,
    updateNotifications: true,
    transactionAlerts: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = localStorage.getItem("planmore_prefs");
    if (local) setPrefs(JSON.parse(local));
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await api("/api/user/preferences");
        if (res) {
          setPrefs(res);
          localStorage.setItem("planmore_prefs", JSON.stringify(res));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updatePrefs(newPrefs) {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    localStorage.setItem("planmore_prefs", JSON.stringify(updated));

    try {
      await api("/api/user/preferences", { method: "PUT", body: updated });
    } catch (e) {
      console.error("Erro ao salvar preferências:", e);
    }

    document.documentElement.classList.toggle("dark", updated.theme === "dark");
  }

  return { prefs, updatePrefs, loading };
}
