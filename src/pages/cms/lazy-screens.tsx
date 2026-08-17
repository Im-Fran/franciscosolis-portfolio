import {lazy} from "react";

/*
 * The CMS is a separate application that happens to be served from this bundle; nobody visiting the
 * portfolio needs its code, so every screen is split out and fetched on demand.
 */

export const SignIn = lazy(() => import("@/pages/cms/sign-in.tsx").then((module) => ({default: module.SignIn})));

export const Callback = lazy(() =>
  import("@/pages/cms/callback.tsx").then((module) => ({default: module.Callback})),
);

export const Dashboard = lazy(() =>
  import("@/pages/cms/dashboard.tsx").then((module) => ({default: module.Dashboard})),
);
