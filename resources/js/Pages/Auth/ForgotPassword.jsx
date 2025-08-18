import { useState } from "react";
import route from "ziggy-js";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword() {
  const [data, setData] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    setStatus("");

    try {
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const res = await fetch(route("password.email"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (res.status === 422) {
        const json = await res.json();
        setErrors(json.errors || {});
      } else if (res.ok) {
        setStatus("Enviamos um link de redefinição de senha para o seu e-mail!");
        setData({ email: "" });
      } else {
        console.error("Erro ao solicitar redefinição:", await res.text());
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
          <PrimaryButton className="ms-4" disabled={processing}>
            {processing ? "Enviando..." : "Enviar link de redefinição"}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
