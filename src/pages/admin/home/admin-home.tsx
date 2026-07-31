import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button/button.tsx";
import { ProjectsManager } from "./components/projects-manager.tsx";
import { ToolboxManager } from "./components/toolbox-manager.tsx";
import { Folder, Wrench, SignOut, User } from "@phosphor-icons/react";

type AdminUser = { id: number; username: string };
type TabType = "projects" | "toolbox";

export const AdminHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("projects");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/auth/me", { credentials: "include" })
      .then((response) => {
        if (!response.ok) {
          if (!cancelled) navigate("/admin/login");
          return null;
        }
        return response.json();
      })
      .then((body) => {
        if (!cancelled && body?.data) setUser(body.data);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const onLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    navigate("/admin/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent-500/30 selection:text-accent-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-950/60 border border-accent-600/40 text-accent-300">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-text">Dashboard Admin</h1>
              <p className="text-xs text-neutral-400">
                {t("admin:home.welcome", { username: user.username })}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={onLogout} className="gap-2">
            <SignOut size={16} />
            <span>{t("admin:home.logout")}</span>
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex space-x-2 border-t border-neutral-800/60 pt-2" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === "projects"
                  ? "border-accent-500 bg-neutral-900/60 text-accent-300"
                  : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
              }`}
            >
              <Folder size={18} />
              <span>Proyectos</span>
            </button>
            <button
              onClick={() => setActiveTab("toolbox")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === "toolbox"
                  ? "border-accent-500 bg-neutral-900/60 text-accent-300"
                  : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
              }`}
            >
              <Wrench size={18} />
              <span>Toolbox</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === "projects" && <ProjectsManager />}
        {activeTab === "toolbox" && <ToolboxManager />}
      </main>
    </div>
  );
};
