import React, { useEffect } from "react";
import Shell from "../Layouts/Shell";
import Swal from "sweetalert2";

export default function EmailVerifiedSuccess() {
  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        window.location.href = "/login";
      } catch (err) {
        console.error("Erro ao sair:", err);
        Swal.fire("Erro", "Falha ao tentar deslogar", "error");
      }
    };

    logout();
  }, []);

  return (
    <Shell>
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          E-mail verificado com sucesso!
        </h1>
        <p className="text-gray-700 mb-6">Agora sua conta está ativa.</p>
        <a
          href="/login"
          className="px-4 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800"
        >
          Ir para o Login
        </a>
      </div>
    </Shell>
  );
}
