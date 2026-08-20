# CMS interface

The screens under `/cms` are the front-end of the `franciscosolis-cms` module of the
[API](https://api.franciscosolis.cl/openapi.json). Everything the module exposes is here: the
content collections, the legal documents, the email templates and their delivery log, and the audit
trail — behind a sign-in of its own.

| Route                          | What it is                                                       |
| ------------------------------ | ---------------------------------------------------------------- |
| `/cms`                         | Overview: what needs attention, where to jump back in, who you are |
| `/cms/sign-in`                 | Sign-in: magic link or Google                                     |
| `/cms/callback`                | Where both providers return; redeems the authorization code       |
| `/cms/content/:collection`     | One collection's entries — filter, reorder, create                |
| `/cms/content/:collection/new` | A new entry                                                       |
| `/cms/content/:collection/:id` | Editing one entry                                                 |
| `/cms/legal`                   | The legal documents the public site serves                        |
| `/cms/legal/new`, `/cms/legal/:id` | Writing one                                                   |
| `/cms/email/templates`         | Reusable messages, referenced by slug when sending                |
| `/cms/email/templates/new`, `/cms/email/templates/:id` | Editing one                               |
| `/cms/email/messages`          | The delivery log                                                  |
| `/cms/email/messages/new`      | Sending a message                                                 |
| `/cms/email/messages/:id`      | One message: what was sent, and what happened to it               |
| `/cms/audit`                   | The record of the writes the CMS made                             |

Everything except `sign-in` and `callback` needs a session; anonymous visitors are sent to
`/cms/sign-in` with a `return_to` so the flow resumes where they were headed. A `return_to` pointing
outside `/cms` is dropped.

The interface used to live at `/apps/cms`. That path still resolves — `router.tsx` forwards the whole
sub-path, query string included, so old links and the previously registered redirect URI keep
working until the application is re-registered.

## A client application of its own

The CMS signs in at the same issuer as the rest of the site, but under its own client id:

| | Site | CMS |
| --- | --- | --- |
| Client id | `franciscosolis-web` | `franciscosolis-cms` |
| Redirect URI | `<origin>/auth/callback` | `<origin>/cms/callback` |
| Storage namespace | `fs.auth.*` | `fs.cms.*` |

That is what makes the access token come back minted **for the CMS**, carrying the roles the account
holds in this application — which is exactly what `/cms/admin/*` checks. It also means the two
sessions are independent: signing in to the site does not sign you in to the CMS, and signing out of
one leaves the other alone.

Mechanically, `<AuthProvider client={cmsAuth}>` wraps the `/cms` subtree, so `useAuth()` inside the
CMS resolves to the CMS session while the rest of the site keeps its own. Everything below that —
the PKCE flow, token rotation, cross-tab sync — is the shared machinery documented in
[AUTH.md](./AUTH.md).

## Signed in is not admitted

Two different questions are asked, and both are answered by the API:

- **Is there a live session?** `GET /auth/me` with the CMS's token. Restoring it is what the
  provider does on load; failing it sends the visitor back to sign-in.
- **Is this account allowed in here?** `GET /cms/admin/me`. It answers `403` for an account with no
  role in the CMS.

The second question is asked **once**, by `CmsProvider`, above the whole signed-in subtree — so a
no-access account meets one explicit screen with a sign-out button instead of a dozen panels each
failing on their own. The fix is usually to come back as someone else, or to be granted the role and
sign in again so a fresh token carries it.

A *per-endpoint* 403 is a different thing and still possible: a role that may edit content but not
read the audit log. Those are handled where they happen, as a no-access state on that panel.

Nothing is gated on roles client-side. They are shown, because knowing what you hold is useful, but
every CMS endpoint re-checks the caller — and since roles are minted into the access token, a change
can take up to the token's lifetime to appear in the interface. The API is always the authority.

## What the API does not promise

Two constraints shaped most of the screens, and both are worth knowing before changing them.

**The list endpoints guarantee very little.** `GET /cms/admin/content/{collection}` promises only
`id`, `collection`, `slug`, `title` and `status`; the audit log promises `id`, `event` and
`created_at`. The service sends more in practice, so `src/lib/cms/types.ts` types the extras
optional and every view renders them defensively. A field the service stops sending degrades a row;
it does not break a screen.

**No list endpoint returns a total.** Paging is `limit`/`offset` with nothing to page against, so
`Pagination` offers "next" exactly when a page came back full, and the overview refuses to present a
derived figure as a total. A count taken from one page is a floor, and showing it as a total would
be a lie the interface repeats every morning.

## Editing

- **Long-form text** — content bodies and legal documents — is markdown, edited with a write/preview
  editor. The source is never round-tripped through HTML, so what the API stores is exactly what was
  typed. The preview is sanitized: markdown passes raw HTML through by design, and a preview shows
  what *another* editor wrote as often as your own.
- **Email bodies** are HTML, not markdown, and are previewed inside a sandboxed `<iframe>`. A
  template is written to be rendered by someone else's mail client; the CMS must not be the place
  where it executes.
- **The `data` field** of a content entry is free-form and has no documented schema, so it is edited
  as JSON rather than through a shape the interface invents. Anything else would drift from the
  service the first time a collection grew a field.
- **Order** is data. `POST /content/{collection}/reorder` takes the whole new order in one call, so
  dragging changes local state and an explicit save commits it — one write per session of nudging
  rather than one per nudge.
- **Deletes** all go through a confirmation that names the record. There is no undo on this API.

## Configuration

| Variable             | Default                             |
| -------------------- | ----------------------------------- |
| `VITE_CMS_BASE_URL`  | `https://api.franciscosolis.cl/cms` |
| `VITE_CMS_CLIENT_ID` | `franciscosolis-cms`                |

The application has to exist on the auth service with this site's CMS callback among its redirect
URIs — `https://franciscosolis.cl/cms/callback` in production, `http://localhost:5173/cms/callback`
for local work. Register it from **Admin → Applications** in the auth interface (leave *Confidential*
off; a browser client cannot keep a secret), then grant the editor accounts a role scoped to it.

Note that the API answers CORS for `https://franciscosolis.cl` only, so a dev server on
`localhost:5173` needs the origin allowed on the service before the CMS can talk to it.

## Layout of the code

```
src/lib/cms/
  config.ts        the CMS API base, the client id, and every route of the interface
  types.ts         the shapes the CMS API answers with
  client.ts        the CMS auth client and one function per endpoint
  cms-context.ts   the editor and the collections, shared by every screen
  cms-provider.tsx loads them once and answers the "admitted?" question above the subtree
  useMutation.ts   the write-side counterpart of useResource
  toast-context.ts / toast-provider.tsx   write confirmations, announced once for the whole console
  format.ts        slugs, datetime-local round-tripping, list splitting
  json.ts          reading and writing the free-form `data` object
  markdown.ts      the sanitized markdown renderer and the prose styles for a preview

src/pages/cms/
  cms-routes.tsx   the subtree, its own AuthProvider, and the one gate every screen shares
  lazy-screens.tsx every screen, split out of the main bundle and fetched on demand
  components/      the shell and its navigation, plus the primitives the sections are built from:
                   data table, paging, confirm dialog, markdown and JSON editors, tag input,
                   sortable list, status badge, empty state, page header
  overview.tsx     the landing
  content/         the collections
  legal/           the legal documents
  email/           templates, the delivery log and the compose screen
  audit/           the audit log
```

### Translations

The shell's own copy lives in the `cms` namespace, which the site preloads. Each section keeps its
own — `cms_overview`, `cms_content`, `cms_legal`, `cms_templates`, `cms_emails`, `cms_audit` — and
those are deliberately **not** in the preload list in `main.tsx`: a visitor reading the portfolio
should never fetch the CMS's copy. A screen loads its namespace by naming it,
`useTranslation(["cms_content", "cms"])`, which is also what makes the shared keys available
alongside its own.
