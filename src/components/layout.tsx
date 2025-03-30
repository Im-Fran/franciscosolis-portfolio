import {Outlet, ScrollRestoration} from "react-router-dom";
import {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";
import CookieConsent from "@/components/cookie-consent.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => <ThemeProvider>
  <div className={className} {...rest}>
    <div className={"min-h-screen flex flex-col"}>
      <Outlet/>
    </div>
    <ScrollRestoration/>
    <CookieConsent/>
    <Footer/>
  </div>
</ThemeProvider>;

export default Layout
export type LayoutProps = BaseProperties