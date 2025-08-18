import { useState } from "react";
import route from "ziggy-js";

import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ initialStatus = "" }) {
  const [status, setStatus] = useState(initialStatus);
  const [processing, setProcessing] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await fetch(route("sanctum.csrf-cookie"), { credentials: "include" });

      const res = await fetch(route("verification.send"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        setStatus("verification-link-sent");
      } else {
        console.error("Erro ao reenviar link:", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(route("logout"), {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      window.location.href = route("login");
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  return (
    <GuestLayout>
      <div className="mb-4 text-sm text-gray-600">
        Obrigado por se cadastrar! Antes de começar, verifique seu endereço de
        e-mail clicando no link que enviamos. Se você não recebeu o e-mail,
        podemos reenviar outro.
      </div>

      {status === "verification-link-sent" && (
        <div className="mb-4 text-sm font-medium text-green-600">
          Um novo link de verificação foi enviado para o endereço de e-mail
          informado no cadastro.
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mt-4 flex items-center justify-between">
          <PrimaryButton disabled={processing}>
            {processing ? "Reenviando..." : "Reenviar link de verificação"}
          </PrimaryButton>

          <button
            type="button"
            onClick={logout}
            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sair
          </button>
        </div>
      </form>
    </GuestLayout>
  );
}
