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
        <div className="navbar-shell">
  <NavLink to="/" className="navbar-brand">
    <img src={Logo} alt="Prefeitura do Paulista" className="navbar-logo" />
  </NavLink>

            {/* Desktop nav */}
            <nav className="navbar-menu hidden md:flex">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} className={linkClass} onClick={() => setOpen(false)}>
                  {it.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile button */}
            <button
              type="button"
              className="navbar-mobile md:hidden"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Fechar" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="navbar-dropdown md:hidden">
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
