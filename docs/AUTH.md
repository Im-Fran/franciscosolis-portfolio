# Auth interface

The screens under `/auth`, plus the hosted sign-in screen at `/apps/auth`, are the front-end of
[`franciscosolis-auth`](https://api.franciscosolis.cl/auth/openapi.json), the centralized auth
service for franciscosolis.cl and its services. That service is a pure API — it renders no HTML —
so every page a user sees during a sign-in is one of these.

| Route            | What it is                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `/auth`          | Sign-in: magic link or Google                                            |
| `/auth/callback` | Where both providers return; redeems the authorization code             |
| `/auth/account`  | Profile, granted access, linked providers, active sessions              |
| `/auth/admin`    | Users, invitations, client applications, roles and permissions          |
| `/apps/auth`     | The service's **hosted** sign-in screen — see below                      |

`/auth/account` and `/auth/admin` need a session; anonymous visitors are sent to `/auth` with a
`return_to` so the flow resumes where they were headed.

## The hosted sign-in screen

`api.franciscosolis.cl` is a backend end to end: it answers JSON and redirects and renders no
pages at all. An OAuth flow has exactly one step that must face a human, and `/apps/auth` is it.

The service's `GET /oauth/authorize` validates a request, parks it, and redirects the browser to
`https://franciscosolis.cl/apps/auth?request=<handle>` (its `AUTH_LOGIN_URL`). The screen then:

1. reads `GET /oauth/authorize/<handle>` for the client's name and the providers this deployment
   actually has configured — it hardcodes none of them;
2. posts an address to `POST /oauth/authorize/<handle>/magic-link`, or navigates to a provider's
   `start_url`;
3. leaves the rest to the service, which redirects back to the *client's* registered redirect URI
   with a single-use code.

This is what sets it apart from `/auth`, and why it is a separate screen rather than a mode of the
same one. `/auth` signs **this site** in: it mints its own PKCE verifier and `state` and drives the
flow as a client. `/apps/auth` signs in whichever application parked the request — which need not
be one of this site's — so it holds no session, no client id and no transaction of its own. The
handle in the query string is its entire context, and holding it grants nothing: a provider still
has to authenticate someone, and the code still goes to the client's registered redirect URI.

Its two `fetch` endpoints are cross-origin by construction; the auth service allows them from any
origin an active client registered (`CORS_PARKED_REQUEST` in its `middleware/cors.ts`).

## How sign-in works

This SPA is a **public OAuth 2.0 client**: it holds no secret and authenticates with PKCE alone.

1. A verifier, its S256 challenge and a `state` are generated and stored as a pending *transaction*.
2. **Magic link** — `POST /magic-link` with the challenge; the service emails a one-time link.
   **Google** — the browser is sent to `GET /oauth/google/authorize` with the same parameters.
3. Either path lands back on `/auth/callback?code=…&state=…`.
4. The callback checks `state`, then exchanges the code and the verifier at `POST /oauth/token`.

The service answers `POST /magic-link` with `202` whether or not the address exists, so the sign-in
screen cannot be used to discover which addresses have an account. Sign-up is invitation-only.

## One stack, several applications

Every application on this origin is its own OAuth client. `createAuthClient(config)` builds one
application's whole stack — its session, its view of the API and its sign-in flow — and
`<AuthProvider client={…}>` puts it in front of a set of routes, so `useAuth()` resolves to whichever
application the subtree belongs to. The site's own client is the default; the CMS nests its own over
`/apps/cms` (see [CMS.md](./CMS.md)).

A client's `storageNamespace` is what keeps the sessions apart: tokens minted for different
applications carry different roles, and signing out of one must not touch the other.

## Token handling

`src/lib/auth/session.ts` owns the token lifecycle outside React, which matters for three reasons:

- **Refresh tokens rotate and are single-use.** Replaying one is treated as theft and revokes the
  whole chain, so every refresh funnels through a single in-flight promise — concurrent callers,
  re-renders and StrictMode's double effects all share one request.
- **Another tab may rotate first.** Tokens are read back from storage on each use and a `storage`
  listener adopts what another tab left behind, rather than overwriting it.
- **A network fault is not a sign-out.** A refresh that never reached the service reports
  `unavailable` and keeps the tokens; only an actual rejection clears the session.

Tokens live in `localStorage`, not `sessionStorage`: a magic link is opened from an email client,
which lands in a *new* tab that would not inherit a per-tab store, and the PKCE verifier has to
survive that hop. The trade-off is that the refresh token is readable by any script on this origin —
the usual cost of a browser-only public client with no back-end of its own to hold it.

## Configuration

Both values are build-time env vars (see `.env.example`), so a preview deployment can point at
another issuer or register under its own client id without a code change:

| Variable               | Default                             |
| ---------------------- | ----------------------------------- |
| `VITE_AUTH_BASE_URL`   | `https://api.franciscosolis.cl/auth` |
| `VITE_AUTH_CLIENT_ID`  | `franciscosolis-web`                 |

Each application registers separately; the CMS's own entry is documented in [CMS.md](./CMS.md).

The application has to exist on the auth service with this site's callback among its redirect URIs —
`https://franciscosolis.cl/auth/callback` in production, `http://localhost:5173/auth/callback` for
local work. Register it from **Admin → Applications** (leave *Confidential* off; a browser client
cannot keep a secret).

## Admin access

Permission slugs are seeded server-side, so the front-end cannot enumerate them ahead of time. The
`Admin` entry is offered when a role or permission looks administrative (`hasAdminAccess`), but that
only decides what is *shown*: every admin endpoint re-checks the caller, and each panel renders an
explicit no-access state when the API answers `403`.

## Layout of the code

Everything below is per-application: each module exports a factory, plus the instance the site's own
`/auth` screens use.

```
src/lib/auth/
  config.ts         an application's client id, routes and storage namespace; the return_to guard
  types.ts          the API's shapes; admin lists only guarantee a few keys, so extras are optional
  pkce.ts           verifier, challenge and state
  storage.ts        token and pending-transaction persistence, namespaced per application
  session.ts        token lifecycle, rotation and cross-tab sync (no React)
  client.ts         fetch wrapper: envelope unwrapping, 401-refresh-retry, typed errors
  api.ts            one function per endpoint
  flow.ts           the sign-in flows end to end
  auth-client.ts    composes the above into one application's client
  auth-provider.tsx restores the session and keeps context in step with the token store
  useResource.ts    load-one-resource hook with abort, retry and 403 reporting
  authorize.ts      the parked-request endpoints behind /apps/auth — no client, no session
src/components/auth/ the sign-in and callback panels, shared by every application on this site
src/pages/auth/      the screens, split out of the main bundle and fetched on demand;
                     authorize.tsx is the hosted screen and belongs to no application here
```
