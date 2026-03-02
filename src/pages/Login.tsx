import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, registerUser } from "@/services/auth";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

type Mode = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    senha: "",
  });

  const [registerForm, setRegisterForm] = useState({
    cpf: "",
    email: "",
    numero: "",
    nome: "",
    login: "",
    senha: "",
  });

  if (currentUser) {
    return <Navigate to="/cadastro" replace />;
  }

  const from = typeof location.state?.from === "string" ? location.state.from : "/cadastro";

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!loginForm.identifier.trim()) {
      setError("Informe o CPF ou e-mail.");
      return;
    }

    if (loginForm.senha.trim().length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const result = loginUser(loginForm.identifier, loginForm.senha);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    navigate(from, { replace: true });
  }

  function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (onlyDigits(registerForm.cpf).length !== 11) {
      setError("Informe um CPF com 11 d\u00edgitos.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(registerForm.email)) {
      setError("Informe um e-mail v\u00e1lido.");
      return;
    }

    if (onlyDigits(registerForm.numero).length < 10) {
      setError("Informe um n\u00famero de telefone v\u00e1lido.");
      return;
    }

    if (registerForm.nome.trim().length < 3) {
      setError("Informe o nome completo.");
      return;
    }

    if (registerForm.login.trim().length < 3) {
      setError("O login deve ter pelo menos 3 caracteres.");
      return;
    }

    if (registerForm.senha.trim().length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const result = registerUser({
      cpf: registerForm.cpf,
      email: registerForm.email,
      numero: registerForm.numero,
      nome: registerForm.nome,
      login: registerForm.login,
      senha: registerForm.senha,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage("Cadastro realizado. Agora entre com seu CPF ou e-mail e a senha.");
    setMode("login");
    setLoginForm({
      identifier: result.user.email,
      senha: "",
    });
    setRegisterForm({
      cpf: "",
      email: "",
      numero: "",
      nome: "",
      login: "",
      senha: "",
    });
  }

  return (
    <section className="panel">
      <div className="panel-body">
        <div className="panel-head">
          <div>
            <h2 className="page-title">Acesso ao cadastro</h2>
            <p className="page-subtitle">
              Para cadastrar informa\u00e7\u00f5es, fa\u00e7a login primeiro ou crie seu acesso local.
            </p>
          </div>
        </div>

        <div className="segmented-control" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={`segment-button${mode === "login" ? " active" : ""}`}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`segment-button${mode === "register" ? " active" : ""}`}
            onClick={() => setMode("register")}
          >
            Criar acesso
          </button>
        </div>

        {error ? <div className="status-error">{error}</div> : null}
        {message ? <div className="status-ok">{message}</div> : null}

        {mode === "login" ? (
          <form onSubmit={submitLogin} className="field-group" style={{ marginTop: "1rem" }}>
            <div>
              <label className="field-label" htmlFor="identifier">
                CPF ou e-mail
              </label>
              <input
                id="identifier"
                className="field-input"
                value={loginForm.identifier}
                onChange={(event) => setLoginForm((state) => ({ ...state, identifier: event.target.value }))}
                placeholder="000.000.000-00 ou nome@exemplo.com"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="senha-login">
                Senha
              </label>
              <input
                id="senha-login"
                type="password"
                className="field-input"
                value={loginForm.senha}
                onChange={(event) => setLoginForm((state) => ({ ...state, senha: event.target.value }))}
              />
            </div>

            <div className="actions-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary">
                Entrar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitRegister} className="field-group" style={{ marginTop: "1rem" }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="cpf">
                  CPF
                </label>
                <input
                  id="cpf"
                  className="field-input"
                  value={registerForm.cpf}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, cpf: event.target.value }))}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="email-register">
                  E-mail
                </label>
                <input
                  id="email-register"
                  type="email"
                  className="field-input"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, email: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="numero">
                  N\u00famero
                </label>
                <input
                  id="numero"
                  className="field-input"
                  value={registerForm.numero}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, numero: event.target.value }))}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  className="field-input"
                  value={registerForm.nome}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, nome: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="login">
                  Login
                </label>
                <input
                  id="login"
                  className="field-input"
                  value={registerForm.login}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, login: event.target.value }))}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="senha-register">
                  Senha
                </label>
                <input
                  id="senha-register"
                  type="password"
                  className="field-input"
                  value={registerForm.senha}
                  onChange={(event) => setRegisterForm((state) => ({ ...state, senha: event.target.value }))}
                />
              </div>
            </div>

            <div className="actions-row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn btn-primary">
                Criar acesso
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
