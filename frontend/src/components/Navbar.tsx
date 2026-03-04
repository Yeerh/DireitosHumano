import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { House, LogIn, LogOut, Menu, MessageSquareMore, SquarePen, X } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/services/auth";

const navItems = [
  { to: "/", label: "In\u00edcio", icon: House },
  { to: "/cadastro", label: "Cadastro", icon: SquarePen },
  { to: "/denuncias", label: "Den\u00fancias e sugest\u00f5es", icon: MessageSquareMore },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  function handleAuthClick() {
    if (currentUser) {
      logoutUser();
      navigate("/", { replace: true });
      return;
    }

    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-row">
          <div className="brand-group">
            <div className="brand-mark">
              <img src="/portal.png" alt="Portal de Direitos Humanos" className="brand-logo" />
            </div>
          </div>

          <nav className="nav-desktop">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  <Icon className="nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <button type="button" className="nav-link nav-button" onClick={handleAuthClick}>
              {currentUser ? <LogOut className="nav-icon" aria-hidden="true" /> : <LogIn className="nav-icon" aria-hidden="true" />}
              <span>{currentUser ? "Sair" : "Entrar"}</span>
            </button>
          </nav>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setOpen((state) => !state)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            {open ? <X className="nav-icon" aria-hidden="true" /> : <Menu className="nav-icon" aria-hidden="true" />}
            <span>{open ? "Fechar" : "Menu"}</span>
          </button>
        </div>
      </div>

      <div className={`mobile-nav${open ? " open" : ""}`}>
        <div className="topbar-inner">
          <nav className="mobile-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  <Icon className="nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <button type="button" className="nav-link nav-button" onClick={handleAuthClick}>
              {currentUser ? <LogOut className="nav-icon" aria-hidden="true" /> : <LogIn className="nav-icon" aria-hidden="true" />}
              <span>{currentUser ? "Sair" : "Entrar"}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
