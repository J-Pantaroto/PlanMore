import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { route } from "ziggy-js";
import Swal from "sweetalert2";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [data, setData] = useState({
    token: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  useEffect(() => {
    setData((d) => ({ ...d, token, email: emailFromUrl }));
  }, [token, emailFromUrl]);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });

      const csrfToken = decodeURIComponent(getCookie("XSRF-TOKEN"));

      const res = await fetch("http://localhost:8000/reset-password", {
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
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: json.errors.email?.[0] || "Verifique os campos informados.",
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
        });
      } else if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Senha redefinida!",
          text: "Sua senha foi alterada com sucesso.",
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
        }).then(() => {
          window.location.href = route("login");
        });
      } else {
        const errorText = await res.text();
        console.error("Falha ao redefinir senha:", errorText);
        Swal.fire({
          icon: "error",
          title: "Falha no servidor",
          text: "Não foi possível redefinir a senha.",
          confirmButtonColor: "#9333ea",
          background: "#1e1b4b",
          color: "#fff",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erro inesperado",
        text: "Tente novamente mais tarde.",
        confirmButtonColor: "#9333ea",
        background: "#1e1b4b",
        color: "#fff",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout>
      <div className="mb-4 text-sm text-gray-600">
        Informe sua nova senha abaixo para redefinir o acesso à sua conta.
      </div>

      <form onSubmit={submit}>
        <div>
          <InputLabel htmlFor="email" value="E-mail" />
          <TextInput
            id="email"
            type="email"
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
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <InputError message={errors.password?.[0]} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="Confirmar senha" />
          <TextInput
            id="password_confirmation"
            type="password"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) =>
              setData({ ...data, password_confirmation: e.target.value })
            }
            required
          />
          <InputError
            message={errors.password_confirmation?.[0]}
            className="mt-2"
          />
        </div>

        <div className="mt-4 flex items-center justify-end">
          <PrimaryButton
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold ms-4"
            disabled={processing}
          >
            {processing ? "Redefinindo..." : "Redefinir senha"}
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
