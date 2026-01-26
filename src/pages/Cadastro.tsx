import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser, findUserByCpf, findUserByEmail } from "@/lib/users.storage";
import type { PortalUser } from "@/lib/users.types";
import { weakHash } from "@/context/AuthContext";

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function isEmailValid(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function validateCpfDigits(cpf: string) {
  const d = onlyDigits(cpf);
  return d.length === 11;
}

export default function Cadastro() {
  const nav = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const eNorm = email.trim().toLowerCase();
    const cpfDigits = onlyDigits(cpf);
    const telDigits = onlyDigits(telefone);

    if (!nome.trim()) return setErr("Informe o nome.");
    if (!eNorm) return setErr("Informe o e-mail.");
    if (!isEmailValid(eNorm)) return setErr("Informe um e-mail válido.");
    if (!validateCpfDigits(cpfDigits)) return setErr("Informe um CPF válido (11 dígitos).");
    if (telDigits.length < 10) return setErr("Informe telefone com DDD.");
    if (!senha.trim() || senha.trim().length < 4) return setErr("A senha deve ter pelo menos 4 caracteres.");

    // Validação de existentes
    if (findUserByEmail(eNorm)) return setErr("Este e-mail já está cadastrado. Faça login.");
    if (findUserByCpf(cpfDigits)) return setErr("Este CPF já está cadastrado. Faça login ou procure suporte.");

    const user: PortalUser = {
      id: uid(),
      createdAt: new Date().toISOString(),
      nome: nome.trim(),
      email: eNorm,
      cpf: cpfDigits,
      telefone: telefone.trim(),
      senhaHash: weakHash(senha.trim()),
    };

    createUser(user);
    setOk("Cadastro realizado com sucesso. Agora faça login para iniciar a triagem.");
    setTimeout(() => nav("/login"), 600);
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Cadastro</h2>
      <p className="mt-2 text-sm text-slate-700">
        Para iniciar a triagem e realizar registros, é necessário criar um acesso e depois fazer login.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}
      {ok && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {ok}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div>
          <label className="label">E-mail *</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@dominio.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">CPF *</label>
            <input className="input" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </div>

          <div>
            <label className="label">Telefone (DDD) *</label>
            <input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(81) 9xxxx-xxxx" />
          </div>
        </div>

        <div>
          <label className="label">Senha *</label>
          <input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Mínimo de 4 caracteres (MVP).</p>
        </div>

        <button
          className="w-full rounded-xl bg-[#1b4c7d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
          type="submit"
        >
          Criar conta
        </button>

        <div className="text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link to="/login" className="font-semibold text-[#1b4c7d] hover:underline">
            Fazer login
          </Link>
        </div>
      </form>
    </div>
  );
}
