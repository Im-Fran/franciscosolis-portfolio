import {Suspense} from "react";
import {Outlet} from "react-router-dom";
import type {RouteObject} from "react-router-dom";
import {AuthLoading} from "@/components/auth/auth-loading.tsx";
import {RequireAuth} from "@/components/auth/require-auth.tsx";
import {AuthProvider} from "@/lib/auth/auth-provider.tsx";
import {cmsAuth} from "@/lib/cms/client.ts";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {Callback, Dashboard, SignIn} from "@/pages/cms/lazy-screens.tsx";

/**
 * Everything under /apps/cms.
 *
 * The whole subtree gets its own `AuthProvider`: the CMS signs in as `franciscosolis-cms`, keeps
 * its session apart from the site's and, being nested, is what `useAuth()` resolves to in here.
 */
export const cmsRoutes: RouteObject = {
  path: "apps/cms",
  element: (
    <AuthProvider client={cmsAuth}>
      <Suspense fallback={<AuthLoading/>}>
        <Outlet/>
      </Suspense>
    </AuthProvider>
  ),
  children: [
    {
      path: "sign-in",
      element: <SignIn/>,
    },
    {
      path: "callback",
      element: <Callback/>,
    },
    {
      /* Pathless layout route, so every screen the CMS grows shares one gate. */
      element: (
        <RequireAuth restoringKey="cms:common.restoring">
          <Outlet/>
        </RequireAuth>
      ),
      children: [
        {
          index: true,
          element: <Dashboard/>,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound/>,
    },
  ],
};
