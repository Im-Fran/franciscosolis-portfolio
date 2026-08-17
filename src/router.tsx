import {createBrowserRouter} from "react-router-dom";
import Layout from "@/components/layout.tsx";
import {Home} from "@/pages/home/home.tsx";
import {Brand} from "@/pages/brand/brand.tsx";
import {Legal} from "@/pages/legal/legal.tsx";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {authRoutes} from "@/pages/auth/auth-routes.tsx";

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