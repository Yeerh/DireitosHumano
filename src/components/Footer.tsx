export default function Footer() {
  return (
  <footer className="mt-auto">
  <div className="nav-gradient">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Prefeitura do Paulista
              </p>
              <p className="text-xs text-white/85">
                Sistema de Mapeamento de Casas de Axé
              </p>
            </div>

            <p className="text-xs text-white/85">
              © {new Date().getFullYear()} • Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
