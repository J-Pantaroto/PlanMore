import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { route } from "ziggy-js";
import Swal from "sweetalert2";
import Checkbox from "@/Components/Checkbox";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status = "", canResetPassword = true }) {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.style.backgroundColor = "#0f172a";
    } else {
      root.classList.remove("dark");
      document.body.style.backgroundColor = "#f9fafb";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const res = await fetch(route("login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          remember: data.remember,
        }),
      });

      if (res.status === 422) {
        Swal.fire({
          icon: "error",
          title: "Erro no login",
          text: "E-mail ou senha incorretos.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (res.ok) {
        const prefsRes = await res.json();

        if (prefsRes.theme) {
          applyTheme(prefsRes.theme);
          localStorage.setItem("theme", prefsRes.theme);
        }

        if (prefsRes.locale) {
          localStorage.setItem("locale", prefsRes.locale);
        }

        if (prefsRes.csrf) {
          const meta = document.querySelector('meta[name="csrf-token"]');
          if (meta) meta.setAttribute("content", prefsRes.csrf);
          else {
            const newMeta = document.createElement("meta");
            newMeta.name = "csrf-token";
            newMeta.content = prefsRes.csrf;
            document.head.appendChild(newMeta);
          }
        }
        Swal.fire({
          icon: "success",
          title: "Bem-vindo!",
          text: "Login realizado com sucesso!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro inesperado",
          text: "Ocorreu um problema ao tentar entrar.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erro de conexão",
        text: "Não foi possível conectar ao servidor.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout>
      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
      )}

      <form onSubmit={submit}>
        <div>
          <InputLabel htmlFor="email" value="E-mail" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            isFocused={true}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Senha" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
        </div>

        <div className="mt-4 block">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData({ ...data, remember: e.target.checked })}
            />
            <span className="ms-2 text-sm text-gray-600 dark:text-gray-300">
              Lembrar-me
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {canResetPassword && (
            <Link
              to="/forgot-password"
              className="rounded-md text-sm text-gray-600 dark:text-gray-300 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Esqueceu sua senha?
            </Link>
          )}

          <PrimaryButton
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
            disabled={processing}
          >
            {processing ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-8">
        <div className="mb-3 text-center text-sm text-gray-500 dark:text-gray-400">
          ou entre com
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              (window.location.href = "http://localhost:8000/auth/google")
            }
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() =>
              (window.location.href = "http://localhost:8000/auth/github")
            }
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            GitHub
          </button>
        </div>
      </div>
    </GuestLayout>
  );
}
