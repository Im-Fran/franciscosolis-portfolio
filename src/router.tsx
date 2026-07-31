import {createBrowserRouter} from "react-router-dom";
import Layout from "@/components/layout.tsx";
import {Home} from "@/pages/home/home.tsx";
import {Legal} from "@/pages/legal/legal.tsx";
import {NotFound} from "@/pages/not-found/not-found.tsx";
import {AdminLogin} from "@/pages/admin/login/login.tsx";

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
      /* Legal */
      {
        path: "legal",
        element: <Legal/>,
      },
      /* Admin */
      {
        path: "admin/login",
        element: <AdminLogin/>,
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