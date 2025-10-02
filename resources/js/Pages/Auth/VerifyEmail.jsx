import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "@/Components/PrimaryButton";
import GuestLayout from "@/Layouts/GuestLayout";
import Swal from "sweetalert2";

export default function VerifyEmail({ initialStatus = "" }) {
  const [status, setStatus] = useState(initialStatus);
  const [processing, setProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });

        if (!res.ok) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!xsrfToken) {
        Swal.fire({
          icon: "error",
          title: "Erro CSRF",
          text: "Token CSRF não encontrado.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      await fetch("/sanctum/csrf-cookie", { credentials: "include" });

      const res = await fetch("/email/verification-notification", { 
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        },
      });

      if (res.ok) {
        setStatus("verification-link-sent");

        Swal.fire({
          icon: "success",
          title: "E-mail de verificação enviado!",
          text: "Verifique sua caixa de entrada.",
          timer: 3000,
          showConfirmButton: false,
        });

        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
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
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      navigate("/login");
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
          <PrimaryButton
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            disabled={processing || cooldown > 0}
          >
            {processing
              ? "Reenviando..."
              : cooldown > 0
              ? `Aguarde ${cooldown}s`
              : "Reenviar link de verificação"}
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
