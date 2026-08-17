import {Suspense} from "react";
import {Outlet} from "react-router-dom";
import type {RouteObject} from "react-router-dom";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {Account, Admin, Callback, SignIn} from "@/pages/auth/lazy-screens.tsx";
import {AuthLoading} from "@/pages/auth/components/auth-loading.tsx";
import {RequireAuth} from "@/pages/auth/components/require-auth.tsx";

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
        <RequireAuth>
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
