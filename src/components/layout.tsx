import {Outlet, ScrollRestoration} from "react-router-dom";
import type {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => (
  <div className={className} {...rest}>
    <main role={"main"} className={"min-h-screen flex flex-col"}>
      <Outlet/>
    </main>
    <ScrollRestoration/>
    <Footer/>
  </div>
);

export default Layout
export type LayoutProps = BaseProperties
