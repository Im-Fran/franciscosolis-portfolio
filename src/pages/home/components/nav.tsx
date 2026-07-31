import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button/button.tsx";

const links: Array<{ href: string; labelKey: string }> = [
  {href: "#home", labelKey: "nav:home"},
  {href: "#stack", labelKey: "nav:stack"},
  {href: "#proyectos", labelKey: "nav:projects"},
  {href: "#experiencia", labelKey: "nav:experience"},
  {href: "#contacto", labelKey: "nav:contact"},
];

export const Nav = () => {
  const {t, i18n} = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    localStorage.setItem("locale", newLang);
    await i18n.changeLanguage(newLang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-bg/78 backdrop-blur-[14px]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <a href="#home" className="text-base font-medium text-text" data-fs-hover>
          FranciscoSolis
        </a>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden text-sm text-neutral-300 hover:text-text transition-colors sm:inline"
              data-fs-hover
            >
              {t(link.labelKey)}
            </a>
          ))}
          <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
            {i18n.language === "es" ? "EN" : "ES"}
          </Button>
        </div>
      </nav>
    </header>
  );
};
