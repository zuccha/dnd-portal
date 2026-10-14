import type { I18nString } from "~/i18n/i18n-string";
import type { Resource } from "~/models/resources/resource";
import type { createIcon } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Resource Action
//------------------------------------------------------------------------------

export type ResourceAction<R extends Resource> = {
  icon: LucideIcon | ReturnType<typeof createIcon>;
  isDisabled?: (resource: R) => boolean;
  isVisible: (resource: R) => boolean;
  label: I18nString;
  onClick: (resource: R) => void | Promise<void>;
};
