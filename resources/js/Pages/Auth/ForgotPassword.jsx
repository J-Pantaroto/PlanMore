import { useState } from "react";
import { route } from 'ziggy-js';
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword() {
  const [data, setData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });

      const csrfToken = decodeURIComponent(getCookie("XSRF-TOKEN"));

      const res = await fetch("http://localhost:8000/password/email", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(data),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        const json = await res.json();
        window.location.href = json.redirect || route("dashboard");
      } else {
        console.error("Falha ao solicitar redefinição:", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };


  return (
    <GuestLayout>
      <div className="mb-4 text-sm text-gray-600">
        Esqueceu sua senha? Sem problemas. Informe seu endereço de e-mail e nós
        enviaremos um link para redefinição de senha, onde você poderá escolher
        uma nova.
      </div>

      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
      )}

      <form onSubmit={submit}>
        <TextInput
          id="email"
          type="email"
          name="email"
          value={data.email}
          className="mt-1 block w-full"
          autoComplete="username"
          isFocused={true}
          onChange={(e) => setData({ email: e.target.value })}
          required
        />

        <InputError message={errors.email?.[0]} className="mt-2" />

        <div className="mt-4 flex items-center justify-end">
          <PrimaryButton className="bg-purple-600 hover:bg-purple-700 text-white font-semibold ms-4" disabled={processing}>
            {processing ? "Enviando..." : "Enviar link de redefinição"}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
