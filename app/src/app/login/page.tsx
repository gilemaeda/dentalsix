"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao fazer login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dental-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-10 h-10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2C12.5 2 10 4 9 7C8 10 8 13 9 16C10 19 11 22 13 25C14.5 27.5 15.5 29 16 30C16.5 29 17.5 27.5 19 25C21 22 22 19 23 16C24 13 24 10 23 7C22 4 19.5 2 16 2Z"
                fill="white"
              />
              <path
                d="M13 8C13 8 14 10 16 10C18 10 19 8 19 8"
                stroke="#A4D12C"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-dental-text">
            DentalSix
          </h1>
          <p className="text-dental-text-muted mt-1">
            Sistema de gestão odontológica
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-dental-border p-8"
        >
          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erro}
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-dental-text mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-dental-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dental-text"
              placeholder="seu@email.com"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="senha"
              className="block text-sm font-medium text-dental-text mb-1.5"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-dental-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-dental-text"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-dental-text-muted mt-6">
          DentalSix &copy; {new Date().getFullYear()} &mdash; Vector Tecnologia
        </p>
      </div>
    </div>
  );
}
