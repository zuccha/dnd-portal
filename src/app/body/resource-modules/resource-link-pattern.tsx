import { Em, Span } from "@chakra-ui/react";
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

      const [maybeKind, maybeId = "", fallback = "", override = ""] = value.split(":");
      const kind = resourceKindSchema.safeParse(maybeKind);
      const id = z.uuid().safeParse(maybeId);
      const resource =
        kind.success && id.success
          ? resources.find((entry) => entry.kind === kind.data && entry.id === id.data)
          : undefined;

      if (!resource) return fallback || missingResourceLabel;

      const text = override || resource.name[lang] || fallback;
      const content =
        resource.kind === "spell" ? (
          <Em>{text}</Em>
        ) : resource.kind === "creature" ? (
          <Span fontWeight="bold">{text}</Span>
        ) : (
          text
        );

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
