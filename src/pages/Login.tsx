import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isQuestionarioCompleto } from "@/lib/flow.storage";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const triagemOk = isQuestionarioCompleto();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = login(email, senha);
    if (!res.ok) {
      setErr(res.message);
      return;
    }

    // Após login:
    // - Se triagem não foi feita, manda para triagem
    // - Se triagem ok, manda para serviços
    if (!triagemOk) nav("/questionario");
    else nav("/");
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Login</h2>
      <p className="mt-2 text-sm text-slate-700">
        Acesse com seu e-mail e senha para iniciar a triagem e registrar informações.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">E-mail</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@dominio.com"
          />
        </div>

        <div>
          <label className="label">Senha</label>
          <input
            className="input"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          className="w-full rounded-xl bg-[#1b4c7d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
          type="submit"
        >
          Entrar
        </button>

        <div className="text-center text-sm text-slate-600">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-[#1b4c7d] hover:underline">
            Criar cadastro
          </Link>
        </div>
      </form>
    </div>
  );
}
