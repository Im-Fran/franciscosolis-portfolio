# CMS interface

The screens under `/apps/cms` are the front-end of the `franciscosolis-cms` module of the
[API](https://api.franciscosolis.cl/openapi.json). This release covers **getting in**: signing in,
holding the session and the access checks around it. The editing screens are built on top of it.

| Route                  | What it is                                                   |
| ---------------------- | ------------------------------------------------------------ |
| `/apps/cms`            | The signed-in landing: who you are, what you may do, what the CMS manages |
| `/apps/cms/sign-in`    | Sign-in: magic link or Google                                 |
| `/apps/cms/callback`   | Where both providers return; redeems the authorization code   |

`/apps/cms` needs a session; anonymous visitors are sent to `/apps/cms/sign-in` with a `return_to`
so the flow resumes where they were headed. A `return_to` pointing outside `/apps/cms` is dropped.

## A client application of its own

The CMS signs in at the same issuer as the rest of the site, but under its own client id:

| | Site | CMS |
| --- | --- | --- |
| Client id | `franciscosolis-web` | `franciscosolis-cms` |
| Redirect URI | `<origin>/auth/callback` | `<origin>/apps/cms/callback` |
| Storage namespace | `fs.auth.*` | `fs.cms.*` |

That is what makes the access token come back minted **for the CMS**, carrying the roles the account
holds in this application — which is exactly what `/cms/admin/*` checks. It also means the two
sessions are independent: signing in to the site does not sign you in to the CMS, and signing out of
one leaves the other alone.

Mechanically, `<AuthProvider client={cmsAuth}>` wraps the `/apps/cms` subtree, so `useAuth()` inside
the CMS resolves to the CMS session while the rest of the site keeps its own. Everything below that
— the PKCE flow, token rotation, cross-tab sync — is the shared machinery documented in
[AUTH.md](./AUTH.md).

## Signed in is not admitted

Two different questions are asked, and both are answered by the API:

- **Is there a live session?** `GET /auth/me` with the CMS's token. Restoring it is what the
  provider does on load; failing it sends the visitor back to sign-in.
- **Is this account allowed in here?** `GET /cms/admin/me`. It answers `403` for an account with no
  role in the CMS, and the interface renders an explicit no-access screen — with a sign-out button,
  since the fix is usually to come back as someone else, or to be granted the role and sign in again
  so a fresh token carries it.

Roles and permissions shown on the landing come from the token, so they can lag a change by up to
the token's lifetime. Nothing is gated on them client-side: every CMS endpoint re-checks the caller.

## Configuration

| Variable             | Default                             |
| -------------------- | ----------------------------------- |
| `VITE_CMS_BASE_URL`  | `https://api.franciscosolis.cl/cms` |
| `VITE_CMS_CLIENT_ID` | `franciscosolis-cms`                |

The application has to exist on the auth service with this site's CMS callback among its redirect
URIs — `https://franciscosolis.cl/apps/cms/callback` in production,
`http://localhost:5173/apps/cms/callback` for local work. Register it from **Admin → Applications**
in the auth interface (leave *Confidential* off; a browser client cannot keep a secret), then grant
the editor accounts a role scoped to it.

## Layout of the code

```
src/lib/cms/
  config.ts     the CMS API base, the client id and the routes of the interface
  types.ts      the shapes the CMS API answers with
  client.ts     the CMS auth client and one function per endpoint used here
src/pages/cms/  the screens, split out of the main bundle and fetched on demand
```
