import {Outlet, ScrollRestoration} from "react-router-dom";
import type {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";
import {CustomCursor} from "@/pages/home/components/custom-cursor.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => (
  <div className={`min-h-screen flex flex-col ${className ?? ""}`} {...rest}>
    <CustomCursor/>
    <main role={"main"} className={"flex-1 flex flex-col"}>
      <Outlet/>
    </main>
    <ScrollRestoration/>
    <Footer/>
  </div>
);

export default Layout
export type LayoutProps = BaseProperties
