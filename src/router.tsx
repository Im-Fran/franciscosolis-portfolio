import {createBrowserRouter} from "react-router-dom";
import Layout from "@/components/layout.tsx";
import {Home} from "@/pages/home/home.tsx";
import {Brand} from "@/pages/brand/brand.tsx";
import {Legal} from "@/pages/legal/legal.tsx";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {authRoutes, authorizeRoutes} from "@/pages/auth/auth-routes.tsx";
import {cmsRoutes} from "@/pages/cms/cms-routes.tsx";
import {CmsLegacyRedirect} from "@/pages/cms/components/legacy-redirect.tsx";

const routes = [
  {
    path: "/",
    element: <Layout/>,
    children: [
      /* Home */
      {
        index: true,
        element: <Home/>,
      },
      /* Brand */
      {
        path: "brand",
        element: <Brand/>,
      },
      /* Legal */
      {
        path: "legal",
        element: <Legal/>,
      },
      /* Auth — sign-in, the OAuth callback and the signed-in areas */
      authRoutes,
      /* The auth service's hosted sign-in screen, where /oauth/authorize sends the browser */
      authorizeRoutes,
      /* CMS — its own application, signed in under its own client id */
      cmsRoutes,
      /* The CMS moved from /apps/cms to /cms; old links and bookmarks still resolve */
      {
        path: "apps/cms/*",
        element: <CmsLegacyRedirect/>,
      },
      /* 404 */
      {
        path: "*",
        element: <NotFound/>,
      },
    ],
  },
];


const router = createBrowserRouter(routes, {
  basename: '/',
});

export default router;