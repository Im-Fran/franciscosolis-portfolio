import {useTranslation} from "react-i18next";
import {useCms} from "@/lib/cms/cms-context.ts";

export type CollectionMeta = {
  slug: string;
  /** The collection's own name, as the service reports it. */
  name: string;
  description: string;
  /** How to name a single entry of it — "project", "certification" — for buttons and confirmations. */
  singular: string;
  /** `false` when the service reports no such collection, which is what a bad URL looks like. */
  known: boolean;
};

/**
 * Everything the content screens need to talk about a collection without knowing which one it is.
 *
 * The name and the description come from the service, so a collection added on the API needs no
 * release here. The singular is the one thing it does not report — "New project" reads better than
 * "New projects" — so it is looked up per slug in this section's own copy, in the language the
 * interface is being read in, and falls back to a neutral wording for a collection nobody has
 * written copy for yet.
 */
export const useCollectionMeta = (slug: string): CollectionMeta => {
  const {t} = useTranslation(["cms_content", "cms"]);
  const {collections} = useCms();
  const match = collections.find((collection) => collection.slug === slug);
  const singular = t(`cms_content:collections.${slug}.singular`, {defaultValue: ""});

  return {
    slug,
    name: match?.name ?? slug,
    description: match?.description ?? "",
    singular: singular || t("cms_content:generic_singular"),
    known: Boolean(match),
  };
};
