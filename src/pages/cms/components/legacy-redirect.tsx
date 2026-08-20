import {Navigate, useLocation} from "react-router-dom";
import {CMS_LEGACY_ROUTE, CMS_ROUTE} from "@/lib/cms/config.ts";

/**
 * The CMS used to live at `/apps/cms`. Old links still land there — and so does every sign-in,
 * because that is the path the application is registered under on the auth service
 * (`CMS_REDIRECT_PATH`). The whole sub-path is therefore forwarded with its query string intact
 * rather than dropped on the new landing: the callback screen needs the `code` and `state` the
 * service appended here.
 */
export const CmsLegacyRedirect = () => {
  const {pathname, search, hash} = useLocation();
  const rest = pathname.startsWith(CMS_LEGACY_ROUTE) ? pathname.slice(CMS_LEGACY_ROUTE.length) : "";
  return <Navigate to={`${CMS_ROUTE}${rest}${search}${hash}`} replace/>;
};
