import {useState, type FormEvent} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {SiGithub, SiGoogle} from "@icons-pack/react-simple-icons";
import {Card, CardBody, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button/button.tsx";

export const AdminLogin = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password}),
      });

      if (response.status === 429) {
        setError(t("admin:login.error_locked"));
        return;
      }
      if (!response.ok) {
        setError(t("admin:login.error_invalid"));
        return;
      }

      navigate("/admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-24">
      <Card elevation="md">
        <CardBody>
          <CardTitle>{t("admin:login.title")}</CardTitle>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm text-neutral-300">
                {t("admin:login.username_label")}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-[var(--radius-sm)] border border-neutral-700 bg-transparent px-3 py-2 text-text"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-neutral-300">
                {t("admin:login.password_label")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-[var(--radius-sm)] border border-neutral-700 bg-transparent px-3 py-2 text-text"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" variant="primary" className="w-full" disabled={submitting} data-fs-hover>
              {t("admin:login.submit")}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-disabled
              title={t("admin:login.social_soon")}
              className="cursor-not-allowed rounded-[var(--radius-sm)] border border-neutral-700 p-2 opacity-50"
            >
              <SiGithub size={18}/>
            </button>
            <button
              type="button"
              aria-disabled
              title={t("admin:login.social_soon")}
              className="cursor-not-allowed rounded-[var(--radius-sm)] border border-neutral-700 p-2 opacity-50"
            >
              <SiGoogle size={18}/>
            </button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
};
