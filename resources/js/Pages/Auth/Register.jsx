import { useState } from "react";
import { route } from "ziggy-js";
import Swal from "sweetalert2"; // 🔹 import SweetAlert
import InputError from "@/Components/InputError";
import ApplicationLogo from "@/Components/ApplicationLogo";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { Link } from "react-router-dom";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [processing, setProcessing] = useState(false);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });
      const csrfToken = decodeURIComponent(getCookie("XSRF-TOKEN"));

      const res = await fetch("http://localhost:8000/register", {
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
        Swal.fire({
          icon: "error",
          title: "Erro no cadastro",
          text:
            json?.errors?.email?.[0] ||
            json?.errors?.password?.[0] ||
            "Verifique os dados e tente novamente.",
          confirmButtonColor: "#d33",
        });
      } else if (res.ok) {
        const json = await res.json();
        Swal.fire({
          icon: "success",
          title: "Conta criada!",
          text: "Seu cadastro foi realizado com sucesso.",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          window.location.href = json.redirect || route("dashboard");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro inesperado",
          text: "Não foi possível concluir o cadastro.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
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
    <div className="min-h-screen flex">
      {/* Coluna da imagem */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-100">
        <img
          src="img/register-bg.jpg"
          alt="Join us"
          className="max-w-md rounded-lg"
        />
      </div>

      {/* Coluna do formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/">
              <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
            </Link>
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900">
            Crie sua conta no <span className="text-purple-600">PlanMore</span>
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <TextInput
                id="name"
                name="name"
                value={data.name}
                placeholder="Nome completo"
                className="w-full"
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
              />
            </div>

            <div>
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                placeholder="E-mail"
                className="w-full"
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required
              />
            </div>

            <div>
              <TextInput
                id="password"
                type="password"
                name="password"
                value={data.password}
                placeholder="Senha"
                className="w-full"
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
              />
            </div>

            <div>
              <TextInput
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                value={data.password_confirmation}
                placeholder="Confirmar senha"
                className="w-full"
                onChange={(e) =>
                  setData({ ...data, password_confirmation: e.target.value })
                }
                required
              />
            </div>

            <PrimaryButton
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
              disabled={processing}
            >
              {processing ? "Cadastrando..." : "Cadastrar"}
            </PrimaryButton>

            <div className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to={route("login")}
                className="text-purple-600 font-semibold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
