import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const contactItems = [
  {
    label: "Av. Mal. Floriano Peixoto, Centro Paulista - PE, Brasil",
    href: "https://maps.google.com/?q=Av.%20Mal.%20Floriano%20Peixoto,%20Centro,%20Paulista%20-%20PE,%20Brasil",
    icon: MapPin,
  },
  { label: "(81) 99635-0311", href: "tel:+5581996350311", icon: Phone },
  { label: "secti@paulista.pe.gov.br", href: "mailto:secti@paulista.pe.gov.br", icon: Mail },
];

const socialItems = [
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "WhatsApp", href: "https://wa.me/5581996350311", icon: MessageCircle },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid footer-grid-simple">
          <section className="footer-column footer-contact-only">
            <h2 className="footer-heading">Contato</h2>
            <div className="footer-contact-list">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="footer-contact-item"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <span className="footer-icon-badge">
                      <Icon className="footer-contact-icon" aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="footer-socials">
              {socialItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="social-link"
                    aria-label={item.label}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    <Icon className="footer-contact-icon" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </section>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            {"\u00a9"} {new Date().getFullYear()} Secretaria de Direitos Humanos
          </p>
        </div>
      </div>
    </footer>
  );
}
