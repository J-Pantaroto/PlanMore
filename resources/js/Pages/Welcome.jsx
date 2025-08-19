import React from "react";

export default function Welcome() {
    return (
        <div className="h-screen flex">
            {/* Lado esquerdo - Ilustra */}
            <div className="w-1/2 hidden md:flex items-center justify-center">
                <img
                    src="/img/welcome-illustration.png"
                    alt="Ilustração PlanMore" />
            </div>

            {/* Lado direito - Login */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-10">
                {/* Logo */}
                <img src="/img/logo.png" alt="PlanMore Logo" className="w-32 mb-6" />

                {/* Título */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bem-vindo ao PlanMore</h2>

                {/* Botões de Login */}
                <div className="w-full max-w-sm space-y-3">
                    <button
                        className="w-full flex items-center justify-center border rounded-lg py-3 shadow-sm hover:bg-lightpurple"
                        onClick={() => window.location.href = "http://localhost:8000/auth/google"}
                    >
                        <img src="/img/google-icon.png" alt="Google" className="w-5 h-5 mr-2" />
                        Entrar com Google
                    </button>

                    <button
                        className="w-full flex items-center justify-center border rounded-lg py-3 shadow-sm hover:bg-lightpurple"
                        onClick={() => window.location.href = "http://localhost:8000/auth/github"}
                    >
                        <img src="/img/github-icon.png" alt="GitHub" className="w-5 h-5 mr-2" />
                        Entrar com GitHub
                    </button>

                    <button
                        className="w-full flex items-center justify-center border rounded-lg py-3 shadow-sm hover:bg-lightpurple"
                        onClick={() => window.location.href = "/login"}
                    >
                        <img src="/img/email-icon.png" alt="Email" className="w-5 h-5 mr-2" />
                        Entrar com Email
                    </button>
                </div>

                {/* Separador */}
                <div className="flex items-center w-full max-w-sm my-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm">ou</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Link de cadastro */}
                <p className="text-gray-600 text-sm">
                    Não tem uma conta? <a href="/register" className="text-darkpurple font-semibold hover:text-lightpurple">Cadastre-se</a>
                </p>

            </div>
        </div>
    );
}
