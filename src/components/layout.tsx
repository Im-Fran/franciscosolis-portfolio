import {Outlet, ScrollRestoration} from "react-router-dom";
import {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";
import CookieConsent from "@/components/cookie-consent.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {TextSizeProvider} from "@/contexts/TextSizeContext.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => <ThemeProvider>
  <TextSizeProvider>
    <div className={className} {...rest}>
      <main role={"main"} className={"min-h-screen flex flex-col"}>
        <Outlet/>
      </main>
      <ScrollRestoration/>
      <CookieConsent/>
      <Footer/>
    </div>
  </TextSizeProvider>
</ThemeProvider>;

export default Layout
export type LayoutProps = BaseProperties