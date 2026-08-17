import {useCallback, useState} from "react";
import type {FormEvent} from "react";
import {useTranslation} from "react-i18next";
import {Link, Navigate, useSearchParams} from "react-router-dom";
import {ArrowLeft, EnvelopeSimple, PaperPlaneTilt} from "@phosphor-icons/react";
import {SiGoogle} from "@icons-pack/react-simple-icons";
import {Alert} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input} from "@/components/ui/input.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {sanitizeReturnTo} from "@/lib/auth/config.ts";
import {startGoogleSignIn, startMagicLink} from "@/lib/auth/flow.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {AuthCard} from "@/pages/auth/components/auth-card.tsx";

type Phase = {kind: "form"} | {kind: "sent"; email: string; expiresIn: number};

/** Entry point of the auth interface: pick a provider and start the authorization code flow. */
export const SignIn = () => {
  const {t} = useTranslation();
  const {status: authStatus} = useAuth();
  const [params] = useSearchParams();
  const returnTo = sanitizeReturnTo(params.get("return_to"));

  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>({kind: "form"});
  const [busy, setBusy] = useState<"magic_link" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providers = useResource(useCallback((signal: AbortSignal) => authApi.status(signal), []));

  /* Until the service answers, assume both providers work rather than disabling the whole screen. */
  const availability = (name: string) =>
    providers.data?.providers.find((provider) => provider.name === name)?.available ?? true;

  const submitMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy("magic_link");
    try {
      const {expires_in} = await startMagicLink(email.trim(), returnTo);
      setPhase({kind: "sent", email: email.trim(), expiresIn: expires_in});
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setBusy(null);
    }
  };

  const continueWithGoogle = async () => {
    setError(null);
    setBusy("google");
    try {
      await startGoogleSignIn(returnTo, email.trim() || undefined);
    } catch (cause) {
      setError(describeError(cause).message);
      setBusy(null);
    }
  };

  if (authStatus === "authenticated") return <Navigate to={returnTo} replace/>;

  if (phase.kind === "sent") {
    return (
      <AuthCard
        title={t("auth:sign_in.sent_title")}
        subtitle={t("auth:sign_in.sent_subtitle", {email: phase.email})}
      >
        <div className="flex flex-col gap-5">
          <Alert tone="success" title={t("auth:sign_in.sent_alert_title")}>
            {t("auth:sign_in.sent_expiry", {minutes: Math.max(1, Math.round(phase.expiresIn / 60))})}
          </Alert>
          <p className="text-[13px] leading-relaxed text-neutral-400">{t("auth:sign_in.sent_note")}</p>
          <Button variant="secondary" onClick={() => setPhase({kind: "form"})} data-fs-hover>
            <ArrowLeft size={16}/> {t("auth:sign_in.use_another")}
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t("auth:sign_in.title")}
      subtitle={t("auth:sign_in.subtitle")}
      footer={
        <>
          {t("auth:sign_in.invite_only")}{" "}
          <Link to="/" className="text-neutral-400 underline-offset-4 transition-colors hover:text-text" data-fs-hover>
            {t("auth:sign_in.back_home")}
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {error && <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

        <form className="flex flex-col gap-4" onSubmit={submitMagicLink} noValidate>
          <Field
            label={t("auth:sign_in.email_label")}
            htmlFor="auth-email"
            hint={t("auth:sign_in.email_hint")}
          >
            <Input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              inputMode="email"
              placeholder={t("auth:sign_in.email_placeholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Button type="submit" disabled={busy !== null || !availability("magic_link")} data-fs-hover>
            {busy === "magic_link" ? <Spinner size={16}/> : <PaperPlaneTilt size={16}/>}
            {t("auth:sign_in.magic_link_cta")}
          </Button>

          {!availability("magic_link") && (
            <p className="text-xs text-neutral-500">{t("auth:sign_in.provider_unavailable")}</p>
          )}
        </form>

        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-neutral-800"/>
          <span className="text-[11px] tracking-[0.12em] text-neutral-600 uppercase">{t("auth:sign_in.divider")}</span>
          <span className="h-px flex-1 bg-neutral-800"/>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            onClick={continueWithGoogle}
            disabled={busy !== null || !availability("google")}
            data-fs-hover
          >
            {busy === "google" ? <Spinner size={16}/> : <SiGoogle size={16}/>}
            {t("auth:sign_in.google_cta")}
          </Button>
          {!availability("google") && (
            <p className="text-xs text-neutral-500">{t("auth:sign_in.provider_unavailable")}</p>
          )}
        </div>

        <p className="flex items-center gap-2 text-[13px] text-neutral-500">
          <EnvelopeSimple size={15}/> {t("auth:sign_in.no_password")}
        </p>
      </div>
    </AuthCard>
  );
};
