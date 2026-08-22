import {useCallback, useState} from "react";
import type {FormEvent, ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {ArrowLeft, EnvelopeSimple, PaperPlaneTilt} from "@phosphor-icons/react";
import {SiGoogle} from "@icons-pack/react-simple-icons";
import {AuthCard} from "@/components/auth/auth-card.tsx";
import {Alert} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input} from "@/components/ui/input.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import type {AuthClient} from "@/lib/auth/auth-client.ts";
import {looksLikeEmail} from "@/lib/auth/format.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";

type Phase = {kind: "form"} | {kind: "sent"; email: string; expiresIn: number};

export type SignInPanelProps = {
  /**
   * i18n namespace holding this application's `sign_in.*` and `errors.*` copy. Every application
   * signs in the same way, so the key names are shared and only the wording differs.
   */
  ns: string;
  /** Whose sign-in this is: the client id, the redirect URI and the session all come from it. */
  client: AuthClient;
  /** Path to land on once the exchange succeeds; already sanitized by the caller. */
  returnTo: string;
  eyebrow?: ReactNode;
  footer?: ReactNode;
};

/**
 * Provider picker and magic-link form — the whole sign-in screen bar its surroundings.
 *
 * Nothing here is specific to one application: the site's `/auth` and the CMS's `/cms/sign-in`
 * render the same panel against their own client and their own copy.
 */
export const SignInPanel = ({ns, client, returnTo, eyebrow, footer}: SignInPanelProps) => {
  const {t} = useTranslation();

  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>({kind: "form"});
  const [busy, setBusy] = useState<"magic_link" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const providers = useResource(
    useCallback((signal: AbortSignal) => client.api.status(signal), [client]),
  );

  /* Until the service answers, assume both providers work rather than disabling the whole screen. */
  const availability = (name: string) =>
    providers.data?.providers.find((provider) => provider.name === name)?.available ?? true;

  const submitMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    /* Caught here rather than at the service, which answers a validation array this screen would
       otherwise render as a bare status line. */
    const address = email.trim();
    if (!looksLikeEmail(address)) return setError("invalid-email");

    setBusy("magic_link");
    try {
      const {expires_in} = await client.flow.startMagicLink(address, returnTo);
      setPhase({kind: "sent", email: address, expiresIn: expires_in});
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
      await client.flow.startGoogleSignIn(returnTo, email.trim() || undefined);
    } catch (cause) {
      setError(describeError(cause).message);
      setBusy(null);
    }
  };

  if (phase.kind === "sent") {
    return (
      <AuthCard
        title={t(`${ns}:sign_in.sent_title`)}
        subtitle={t(`${ns}:sign_in.sent_subtitle`, {email: phase.email})}
        eyebrow={eyebrow}
      >
        <div className="flex flex-col gap-5">
          <Alert tone="success" title={t(`${ns}:sign_in.sent_alert_title`)}>
            {t(`${ns}:sign_in.sent_expiry`, {minutes: Math.max(1, Math.round(phase.expiresIn / 60))})}
          </Alert>
          <p className="text-[13px] leading-relaxed text-neutral-400">{t(`${ns}:sign_in.sent_note`)}</p>
          <Button variant="secondary" onClick={() => setPhase({kind: "form"})} data-fs-hover>
            <ArrowLeft size={16}/> {t(`${ns}:sign_in.use_another`)}
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t(`${ns}:sign_in.title`)}
      subtitle={t(`${ns}:sign_in.subtitle`)}
      eyebrow={eyebrow}
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        {error && <Alert tone="error">{t(`${ns}:errors.${error}`, {defaultValue: error})}</Alert>}

        <form className="flex flex-col gap-4" onSubmit={submitMagicLink} noValidate>
          <Field
            label={t(`${ns}:sign_in.email_label`)}
            htmlFor="auth-email"
            hint={t(`${ns}:sign_in.email_hint`)}
          >
            <Input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              inputMode="email"
              placeholder={t(`${ns}:sign_in.email_placeholder`)}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Button type="submit" disabled={busy !== null || !availability("magic_link")} data-fs-hover>
            {busy === "magic_link" ? <Spinner size={16}/> : <PaperPlaneTilt size={16}/>}
            {t(`${ns}:sign_in.magic_link_cta`)}
          </Button>

          {!availability("magic_link") && (
            <p className="text-xs text-neutral-500">{t(`${ns}:sign_in.provider_unavailable`)}</p>
          )}
        </form>

        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-neutral-800"/>
          <span className="text-[11px] tracking-[0.12em] text-neutral-600 uppercase">
            {t(`${ns}:sign_in.divider`)}
          </span>
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
            {t(`${ns}:sign_in.google_cta`)}
          </Button>
          {!availability("google") && (
            <p className="text-xs text-neutral-500">{t(`${ns}:sign_in.provider_unavailable`)}</p>
          )}
        </div>

        <p className="flex items-center gap-2 text-[13px] text-neutral-500">
          <EnvelopeSimple size={15}/> {t(`${ns}:sign_in.no_password`)}
        </p>
      </div>
    </AuthCard>
  );
};
