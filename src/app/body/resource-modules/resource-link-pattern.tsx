import { Em } from "@chakra-ui/react";
import { useMemo } from "react";
import { z } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Resource } from "~/models/resources/resource";
import { resourceKindSchema } from "~/models/types/resource-kind";
import { resourceDetailRoute } from "~/navigation/routes";
import RichText, { type RichTextPattern } from "~/ui/rich-text";
import RouterLink from "~/ui/router-link";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Resource Link Renderer
//------------------------------------------------------------------------------

export type ResourceLinkRenderer = (
  resource: Pick<Resource, "id" | "kind">,
  children: ReactNode,
) => ReactNode;

//------------------------------------------------------------------------------
// Create Resource Link Pattern
//------------------------------------------------------------------------------

export function createResourceLinkPattern(
  resources: Resource[],
  lang: string,
  missingResourceLabel: string,
  linkResources = true,
  renderLink?: ResourceLinkRenderer,
): RichTextPattern {
  return {
    regex: /\[\[([\s\S]+?)\]\]/,
    render: (value) => {
      if (typeof value !== "string") return value;

      const firstSeparator = value.indexOf(":");
      const secondSeparator = value.indexOf(":", firstSeparator + 1);
      const kindValue = firstSeparator < 0 ? "" : value.slice(0, firstSeparator);
      const id =
        firstSeparator < 0
          ? ""
          : secondSeparator < 0
            ? value.slice(firstSeparator + 1)
            : value.slice(firstSeparator + 1, secondSeparator);
      const fallback =
        secondSeparator < 0 ? "" : value.slice(secondSeparator + 1).replaceAll("]\\]", "]]");
      const kind = resourceKindSchema.safeParse(kindValue);
      const validId = z.uuid().safeParse(id);
      const resource =
        kind.success && validId.success
          ? resources.find((entry) => entry.kind === kind.data && entry.id === id)
          : undefined;

      if (!resource) return fallback || missingResourceLabel;

      const content = <Em>{resource.name[lang] || fallback}</Em>;

      if (!linkResources) return content;
      if (renderLink) return renderLink(resource, content);

      return (
        <RouterLink
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          to={resourceDetailRoute(resource.kind, resource.id)}
        >
          {content}
        </RouterLink>
      );
    },
  };
}

//------------------------------------------------------------------------------
// Use Resource Link Patterns
//------------------------------------------------------------------------------

export function useResourceLinkPatterns(
  resources: Resource[],
  linkResources = true,
  renderLink?: ResourceLinkRenderer,
): RichTextPattern[] {
  const { lang, t } = useI18nLangContext(i18nContext);

  return useMemo(
    () => [
      ...RichText.defaultPatterns,
      createResourceLinkPattern(resources, lang, t("missing_resource"), linkResources, renderLink),
    ],
    [lang, linkResources, renderLink, resources, t],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  missing_resource: {
    en: "Missing Resource",
    it: "Risorsa Mancante",
  },
};
