import {Outlet, ScrollRestoration} from "react-router-dom";
import {clsx} from "clsx";
import {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";
import CookieConsent from "@/components/cookie-consent.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => {
  const containerClasses = clsx([
    "bg-neutral-100 text-neutral-800 transition-colors duration-200 dark:bg-neutral-800 dark:text-neutral-50",
    className || "",
  ]);

  return <div className={containerClasses} {...rest}>
    <div className={"flex"}>
      <div className={"flex h-full w-full flex-col gap-20"}>
        <div className={"container mx-auto min-h-screen"}>
          <Outlet />
        </div>
      </div>
    </div>

    <ScrollRestoration />
    <Footer/>

    <CookieConsent/>
  </div>;
};

export default Layout
export type LayoutProps = BaseProperties