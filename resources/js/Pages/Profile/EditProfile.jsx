import React, { useState, useEffect } from "react";
import Shell from "../../Layouts/Shell";
import { ensureCsrf } from "@/bootstrap";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function EditProfile() {
  const { t } = useTranslation();

  const [profile, setProfile] = useState({ name: "", email: "", provider_name: null });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    fetch("/profile", { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(t("alerts.error"));
        return res.json();
      })
      .then((data) =>
        setProfile({
          name: data.name || "",
          email: data.email || "",
          provider_name: data.provider_name || null,
        })
      )
      .catch((err) => console.error(t("alerts.error"), err));
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const getCookie = (name) => {
    const safeName = name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1"); 
    const regex = new RegExp(`(?:^|; )${safeName}=([^;]*)`);
    const match = document.cookie.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await ensureCsrf();
      const xsrf = getCookie("XSRF-TOKEN");

      const res = await fetch("/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(xsrf),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(profile),
        credentials: "include",
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        Swal.fire({
          icon: "success",
          title: t("alerts.success"),
          text: t("alerts.updated"),
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        console.error("Falha ao atualizar perfil:", await res.text());
      }
    } catch (err) {
      console.error(t("alerts.error"), err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await ensureCsrf();
      const xsrf = getCookie("XSRF-TOKEN");

      const res = await fetch("/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(xsrf),
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(passwordData),
        credentials: "include",
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        Swal.fire({
          icon: "success",
          title: t("alerts.success"),
          text: t("alerts.updated"),
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      } else {
        console.error("Falha ao atualizar senha:", await res.text());
      }
    } catch (err) {
      console.error(t("alerts.error"), err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">
        {t("account.profile")}
      </h1>

      <form onSubmit={handleSubmitProfile} className="space-y-6 max-w-xl">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("account.name")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {errors.name && (
            <div className="text-red-500 text-sm">{errors.name}</div>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("account.email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                       rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {errors.email && (
            <div className="text-red-500 text-sm">{errors.email}</div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition"
          disabled={processing}
        >
          {processing ? t("buttons.save") + "..." : t("buttons.save")}
        </button>
      </form>

      {!profile.provider_name ? (
        <>
          <h2 className="text-xl font-semibold mt-12 mb-6 text-gray-900 dark:text-white">
            {t("account.password")}
          </h2>
          <form onSubmit={handleSubmitPassword} className="space-y-6 max-w-xl">
            <div>
              <label
                htmlFor="current_password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("account.current_password") || "Senha atual"}
              </label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value,
                  })
                }
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                           rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {errors.current_password && (
                <div className="text-red-500 text-sm">
                  {errors.current_password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("account.new_password") || "Nova senha"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password: e.target.value,
                  })
                }
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                           rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {errors.password && (
                <div className="text-red-500 text-sm">{errors.password}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("account.confirm_password")}
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password_confirmation: e.target.value,
                  })
                }
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 
                           rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {errors.password_confirmation && (
                <div className="text-red-500 text-sm">
                  {errors.password_confirmation}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition"
              disabled={processing}
            >
              {processing ? t("buttons.save") + "..." : t("buttons.save")}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-6 text-gray-600 dark:text-gray-400">
          {t("account.social_login") ||
            `Você está logado via ${profile.provider_name}. Alterar senha não está disponível.`}
        </p>
      )}
    </Shell>
  );
}
