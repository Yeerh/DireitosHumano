import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isQuestionarioCompleto } from "@/lib/flow.storage";

/**
 * Regras do fluxo (como você pediu):
 * 1) Primeiro faz CADASTRO (criar conta)
 * 2) Depois faz LOGIN
 * 3) Só então pode iniciar TRIAGEM e registrar
 *
 * Observação:
 * - Aqui eu estou usando isQuestionarioCompleto() como "triagem concluída".
 * - Você pode renomear depois se quiser.
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const triagemOk = isQuestionarioCompleto();

  // Ajuste aqui se o seu cadastro estiver em outra rota
  const CADASTRO_ROUTE = "/cadastro";
  const LOGIN_ROUTE = "/login";
  const TRIAGEM_ROUTE = "/questionario";

  function getPrimaryCTA() {
    if (!isAuthenticated) {
      return { to: CADASTRO_ROUTE, label: "Criar acesso (cadastro)" };
    }
    if (!triagemOk) {
      return { to: TRIAGEM_ROUTE, label: "Iniciar triagem" };
    }
    return { to: "/cadastro-terreiro", label: "Acessar serviços do portal" };
  }

  const primary = getPrimaryCTA();

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Portal dos Direitos Humanos
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              Plataforma dedicada ao fortalecimento de políticas públicas, com foco no{" "}
              <strong>mapeamento e cadastro de Terreiros de Umbanda</strong> e no{" "}
              <strong>registro de atendimentos e demandas LGBTQIAPN+</strong>.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to={primary.to}
                className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#163e66] focus:outline-none focus:ring-4 focus:ring-[#1b4c7d]/20"
              >
                {primary.label}
              </Link>

              {!isAuthenticated ? (
                <Link
                  to={LOGIN_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Já tenho conta (login)
                </Link>
              ) : (
                <Link
                  to="/denuncias"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Denúncias & Sugestões
                </Link>
              )}
            </div>
          </div>

          {/* STATUS */}
          <div className="grid w-full max-w-md gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Status de acesso</div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4">
                <div className="text-xs font-semibold text-slate-500">Cadastro/Login</div>
                <div className="mt-1 text-sm font-semibold">
                  <span className={isAuthenticated ? "text-emerald-700" : "text-slate-700"}>
                    {isAuthenticated ? "Autenticado" : "Não autenticado"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {isAuthenticated ? "Acesso liberado" : "É necessário criar conta e entrar"}
                </div>
              </div>

              <div className="rounded-xl bg-white p-4">
                <div className="text-xs font-semibold text-slate-500">Triagem</div>
                <div className="mt-1 text-sm font-semibold">
                  <span className={triagemOk ? "text-emerald-700" : "text-slate-700"}>
                    {triagemOk ? "Concluída" : "Pendente"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {triagemOk ? "Você já pode registrar" : "Obrigatória antes do registro"}
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                Para iniciar a triagem e usar os serviços, primeiro realize o <strong>cadastro</strong> e em seguida
                faça <strong>login</strong>.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PARA QUE SERVE */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <h2 className="text-xl font-semibold text-slate-900">Finalidade do Portal</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          O portal centraliza registros, orientações e encaminhamentos, garantindo organização, rastreabilidade e melhor
          direcionamento dos atendimentos.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Cadastro de Terreiros (Umbanda)</div>
            <p className="mt-2 text-sm text-slate-700">
              Registro institucional do terreiro: informações básicas, endereço, liderança religiosa e contato.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Atendimento LGBTQIAPN+</div>
            <p className="mt-2 text-sm text-slate-700">
              Registro de demandas e solicitações para acolhimento, orientação e encaminhamentos.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Denúncias & Sugestões</div>
            <p className="mt-2 text-sm text-slate-700">
              Canal dedicado para relatos e melhorias, ajudando o monitoramento e a qualidade do serviço.
            </p>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (CADASTRO -> LOGIN -> TRIAGEM -> REGISTRO) */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <h2 className="text-xl font-semibold text-slate-900">Como acessar os serviços</h2>
        <p className="mt-2 text-sm text-slate-700">
          Para segurança e controle de acesso, o registro só é liberado após cadastro e autenticação.
        </p>

        <ol className="mt-6 grid gap-3 lg:grid-cols-3">
          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold text-slate-500">Etapa 1</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Cadastro</div>
            <p className="mt-2 text-sm text-slate-700">
              Crie seu acesso para iniciar a triagem e utilizar os serviços do portal.
            </p>
            <div className="mt-4">
              <Link
                to={CADASTRO_ROUTE}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Ir para cadastro
              </Link>
            </div>
          </li>

          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold text-slate-500">Etapa 2</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Login</div>
            <p className="mt-2 text-sm text-slate-700">
              Entre com seu acesso para liberar a triagem e ações de registro.
            </p>
            <div className="mt-4">
              <Link
                to={LOGIN_ROUTE}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Ir para login
              </Link>
            </div>
          </li>

          <li className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-xs font-semibold text-slate-500">Etapa 3</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Triagem e Registro</div>
            <p className="mt-2 text-sm text-slate-700">
              Após login, realize a triagem e então registre: Terreiro (Umbanda) ou Atendimento LGBTQIAPN+.
            </p>
            <div className="mt-4">
              <Link
                to={TRIAGEM_ROUTE}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
              >
                Iniciar triagem
              </Link>
            </div>
          </li>
        </ol>
      </section>

      {/* CARDS DE DESTINO */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold text-slate-900">Cadastro de Terreiro</h3>
          <p className="mt-2 text-sm text-slate-700">
            Acesse o formulário de cadastro institucional do Terreiro de Umbanda.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {!isAuthenticated ? (
              <>
                <Link
                  to={CADASTRO_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
                >
                  Criar acesso
                </Link>
                <Link
                  to={LOGIN_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Já tenho conta
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={TRIAGEM_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
                >
                  Fazer triagem
                </Link>
                <Link
                  to="/cadastro-terreiro"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Ir para cadastro do Terreiro
                </Link>
              </>
            )}
          </div>

          {!triagemOk && isAuthenticated && (
            <p className="mt-3 text-xs text-slate-500">
              Observação: o registro só é recomendado após finalizar a triagem.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold text-slate-900">Atendimento LGBTQIAPN+</h3>
          <p className="mt-2 text-sm text-slate-700">
            Registre demandas para acolhimento, orientação e encaminhamentos.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {!isAuthenticated ? (
              <>
                <Link
                  to={CADASTRO_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
                >
                  Criar acesso
                </Link>
                <Link
                  to={LOGIN_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Já tenho conta
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={TRIAGEM_ROUTE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1b4c7d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163e66]"
                >
                  Fazer triagem
                </Link>
                <Link
                  to="/atendimento"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Ir para Atendimento
                </Link>
              </>
            )}
          </div>

          {!triagemOk && isAuthenticated && (
            <p className="mt-3 text-xs text-slate-500">
              Observação: o registro só é recomendado após finalizar a triagem.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
