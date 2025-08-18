import { useState } from "react";
import { Link } from "react-router-dom";
import { route } from 'ziggy-js';
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
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
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const res = await fetch(route("login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          remember: data.remember,
        }),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        // redireciona após login
        window.location.href = route("dashboard");
      } else {
        console.error("Falha no login:", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const oauthLogin = (provider) => {
    // redireciona para a rota nomeada do OAuth no Laravel
    window.location.href = route("oauth.redirect", { provider });
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
          <InputError message={errors.email?.[0]} className="mt-2" />
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
          <InputError message={errors.password?.[0]} className="mt-2" />
        </div>

        <div className="mt-4 block">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData({ ...data, remember: e.target.checked })}
            />
            <span className="ms-2 text-sm text-gray-600">Lembrar-me</span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {canResetPassword && (
            <Link
              to="/forgot-password"
              className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Esqueceu sua senha?
            </Link>
          )}

          <PrimaryButton className="ms-4" disabled={processing}>
            {processing ? "Entrando..." : "Entrar"}
          </PrimaryButton>
        </div>
      </form>

      {/* --- bloco de login social --- */}
      <div className="mt-8">
        <div className="mb-3 text-center text-sm text-gray-500">
          ou entre com
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => oauthLogin("google")}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => oauthLogin("github")}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            GitHub
          </button>
        </div>
      </div>
      {/* --- fim bloco de login social --- */}
    </GuestLayout>
  );
}
