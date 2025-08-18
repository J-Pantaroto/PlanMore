import { useEffect, useState } from "react";
import route from "ziggy-js";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword() {
  // tenta pegar token e email da URL (?token=...&email=...)
  const [data, setData] = useState({
    token: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    const email = params.get("email") || "";
    setData((d) => ({ ...d, token, email }));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      // Se estiver usando Sanctum
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const res = await fetch(route("password.store"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          token: data.token,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        // redefiniu com sucesso: envie para login ou dashboard
        window.location.href = route("login");
      } else {
        console.error("Falha ao redefinir senha:", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout>
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
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
          <InputError message={errors.email?.[0]} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Nova senha" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <InputError message={errors.password?.[0]} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="Confirmar nova senha" />
          <TextInput
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) =>
              setData({ ...data, password_confirmation: e.target.value })
            }
            required
          />
          <InputError message={errors.password_confirmation?.[0]} className="mt-2" />
        </div>

        {/* mantém o token oculto para inspecionar/debugar */}
        {/* <input type="hidden" name="token" value={data.token} /> */}

        <div className="mt-4 flex items-center justify-end">
          <PrimaryButton className="ms-4" disabled={processing}>
            {processing ? "Redefinindo..." : "Redefinir senha"}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
