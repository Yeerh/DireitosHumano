import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "@/assets/logo-prefeitura.png";

type NavItem = { to: string; label: string };

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const items: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Início" },
      { to: "/cadastro", label: "Novo cadastro" },
      { to: "/denuncias", label: "Denúncias & Sugestões" },
    ],
    []
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    ["nav-link", isActive ? "nav-link--active" : ""].join(" ");

  return (
    <header className="sticky top-0 z-20">
      <div className="nav-gradient nav-shadow">
        <div className="mx-auto w-full max-w-6xl px-4">
          {/* altura do navbar para comportar logo 150 */}
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <img src={Logo} alt="Prefeitura do Paulista" className="navbar-logo" />

              <div className="hidden sm:block leading-tight">
                <div className="h3">Portal dos Direitos Humanos</div>
                <div className="muted">Prefeitura do Paulista</div>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-2 md:flex">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} className={linkClass} onClick={() => setOpen(false)}>
                  {it.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile button */}
            <button
              type="button"
              className="md:hidden rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-800 backdrop-blur hover:bg-white/80"
              aria-label="Abrir menu"
              onClick={() => setOpen((s) => !s)}
            >
              {open ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-slate-200/70 bg-white/50 backdrop-blur">
            <div className="mx-auto w-full max-w-6xl px-4 py-3">
              <div className="flex flex-col gap-2">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    className={({ isActive }) =>
                      ["nav-link", "nav-link--mobile", isActive ? "nav-link--active" : ""].join(" ")
                    }
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
