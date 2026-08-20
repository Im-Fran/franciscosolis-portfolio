import {Suspense} from "react";
import {Outlet} from "react-router-dom";
import type {RouteObject} from "react-router-dom";
import {AuthLoading} from "@/components/auth/auth-loading.tsx";
import {RequireAuth} from "@/components/auth/require-auth.tsx";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {Account, Admin, Authorize, Callback, SignIn} from "@/pages/auth/lazy-screens.tsx";

/** Everything under /auth: sign-in, the OAuth callback and the areas that need a session. */
export const authRoutes: RouteObject = {
  path: "auth",
  element: (
    <Suspense fallback={<AuthLoading/>}>
      <Outlet/>
    </Suspense>
  ),
  children: [
    {
      index: true,
      element: <SignIn/>,
    },
    {
      path: "callback",
      element: <Callback/>,
    },
    {
      /* Pathless layout route, so both signed-in screens share one gate. */
      element: (
        <RequireAuth restoringKey="auth:account.restoring">
          <Outlet/>
        </RequireAuth>
      ),
      children: [
        {
          path: "account",
          element: <Account/>,
        },
        {
          path: "admin",
          element: <Admin/>,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound/>,
    },
  ],
};

/**
 * The auth service's hosted sign-in screen, at /apps/auth.
 *
 * Kept apart from `authRoutes` on purpose. Everything under `/auth` belongs to *this site* and
 * signs in under its own client id; this one belongs to the auth service and signs in whichever
 * application parked the request it was handed. It is public and stateless — the handle in the
 * query string is the whole context — so it sits outside both the gate and any `AuthProvider`.
 */
export const authorizeRoutes: RouteObject = {
  path: "apps/auth",
  element: (
    <Suspense fallback={<AuthLoading/>}>
      <Outlet/>
    </Suspense>
  ),
  children: [
    {
      index: true,
      element: <Authorize/>,
    },
    {
      path: "*",
      element: <NotFound/>,
    },
  ],
};
