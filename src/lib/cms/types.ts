/** Types mirroring the CMS API (https://api.franciscosolis.cl/openapi.json), `/cms` module. */

/** Service status: what this CMS is and which collections it manages. */
export type CmsStatus = {
  message: string;
  collections: string[];
};

export type CmsCollection = {
  slug: string;
  name: string;
  description: string;
};

/**
 * The editor behind the current access token.
 *
 * Roles and permissions are the ones minted into the token by the auth service, so they can lag a
 * change by up to the token's lifetime — the API itself is always the authority.
 */
export type CmsEditor = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  roles: string[];
  permissions: string[];
  application_id: string;
  session_id: string;
};
