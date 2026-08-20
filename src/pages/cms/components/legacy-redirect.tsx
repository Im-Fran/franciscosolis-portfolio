import {Navigate, useLocation} from "react-router-dom";
import {CMS_ROUTE} from "@/lib/cms/config.ts";

/**
 * The CMS used to live at `/apps/cms`. Old links — and, until the application is re-registered on
 * the auth service, the old redirect URI — still land there, so the whole sub-path is forwarded
 * with its query string intact rather than dropped on the new landing.
 */
export const CmsLegacyRedirect = () => {
  const {pathname, search, hash} = useLocation();
  const rest = pathname.replace(/^\/apps\/cms/, "");
  return <Navigate to={`${CMS_ROUTE}${rest}${search}${hash}`} replace/>;
};
