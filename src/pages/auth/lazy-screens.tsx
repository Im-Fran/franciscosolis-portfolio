import {lazy} from "react";

/*
 * The auth screens — the admin console above all — are a good deal of code that most visitors of
 * the site never open, so they are split out of the main bundle and fetched on demand.
 */

export const SignIn = lazy(() => import("@/pages/auth/sign-in.tsx").then((module) => ({default: module.SignIn})));

export const Callback = lazy(() =>
  import("@/pages/auth/callback.tsx").then((module) => ({default: module.Callback})),
);

export const Account = lazy(() =>
  import("@/pages/auth/account/account.tsx").then((module) => ({default: module.Account})),
);

export const Admin = lazy(() => import("@/pages/auth/admin/admin.tsx").then((module) => ({default: module.Admin})));
