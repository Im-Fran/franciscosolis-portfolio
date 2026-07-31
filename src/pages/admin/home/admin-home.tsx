import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Card, CardBody, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button/button.tsx";

type AdminUser = { id: number; username: string };

export const AdminHome = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/auth/me", {credentials: "include"})
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
    await fetch("/api/admin/auth/logout", {method: "POST", credentials: "include"});
    navigate("/admin/login");
  };

  if (!user) return null;

  return (
    <section className="container mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-24">
      <Card elevation="md">
        <CardBody>
          <CardTitle>{t("admin:home.welcome", {username: user.username})}</CardTitle>
          <Button variant="secondary" className="mt-6" onClick={onLogout} data-fs-hover>
            {t("admin:home.logout")}
          </Button>
        </CardBody>
      </Card>
    </section>
  );
};
