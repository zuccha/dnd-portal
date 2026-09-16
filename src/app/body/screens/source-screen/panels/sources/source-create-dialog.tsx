import { CloseButton, Dialog, Portal, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import { type SourceBundle, sourceBundleResourcesSchema } from "~/models/catalogue/source-bundle";
import { parseSourceBundle } from "~/models/catalogue/source-bundle-migrations/migrate-source-bundle";
import { type SourceType, useSourceTypeOptions } from "~/models/types/source-type";
import { type SourceVersion, useSourceVersionTranslations } from "~/models/types/source-version";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import TextInput from "~/ui/input";
import Select from "~/ui/select";
import { createUuid } from "~/utils/uuid";

//------------------------------------------------------------------------------
// Source Create Dialog
//------------------------------------------------------------------------------

export type SourceCreateDialogProps = {
  creating: boolean;
  onCreate: (bundle: SourceBundle) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export default function SourceCreateDialog({
  creating,
  onCreate,
  onOpenChange,
  open,
}: SourceCreateDialogProps) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const sourceTypeOptions = useSourceTypeOptions();
  const sourceVersionOptions = useSourceVersionTranslations();
  const [draft, setDraft] = useState(createSourceDraft);

  function submit(): void {
    const source = sourceDraftToSource(draft, lang);
    onCreate(createEmptySourceBundle(source));
  }

  return (
    <Dialog.Root
      lazyMount
      onOpenChange={({ open }) => {
        if (open) setDraft(createSourceDraft());
        onOpenChange(open);
      }}
      open={open}
      size="md"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("create")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} w="full">
                <CaptionInput caption={t("name")} w="full">
                  <TextInput
                    disabled={creating}
                    onValueChange={(name) =>
                      setDraft((prev) => ({
                        ...prev,
                        name,
                      }))
                    }
                    size="sm"
                    value={draft.name}
                  />
                </CaptionInput>

                <CaptionInput caption={t("code")} w="full">
                  <TextInput
                    disabled={creating}
                    onValueChange={(code) =>
                      setDraft((prev) => ({
                        ...prev,
                        code,
                      }))
                    }
                    size="sm"
                    value={draft.code}
                  />
                </CaptionInput>

                <CaptionInput caption={t("type")} w="full">
                  <Select.Enum<SourceType>
                    disabled={creating}
                    onValueChange={(type) =>
                      setDraft((prev) => ({
                        ...prev,
                        type,
                      }))
                    }
                    options={sourceTypeOptions}
                    size="sm"
                    value={draft.type}
                    withinDialog
                  />
                </CaptionInput>

                <CaptionInput caption={t("version")} w="full">
                  <Select.Enum<SourceVersion>
                    disabled={creating}
                    onValueChange={(version) =>
                      setDraft((prev) => ({
                        ...prev,
                        version,
                      }))
                    }
                    options={sourceVersionOptions}
                    size="sm"
                    value={draft.version}
                    withinDialog
                  />
                </CaptionInput>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button disabled={creating} variant="outline">
                  {t("cancel")}
                </Button>
              </Dialog.ActionTrigger>

              <Button loading={creating} onClick={submit}>
                {t("create")}
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" right={2} top={2} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

//------------------------------------------------------------------------------
// Source Draft
//------------------------------------------------------------------------------

type SourceDraft = {
  code: string;
  name: string;
  type: SourceType;
  version: SourceVersion;
};

function createSourceDraft(): SourceDraft {
  return {
    code: "",
    name: "",
    type: "campaign",
    version: "dnd5_5",
  };
}

function sourceDraftToSource(draft: SourceDraft, lang: string): Source {
  return {
    code: draft.code.trim(),
    id: createUuid(),
    includes: [],
    name: { [lang]: draft.name.trim() },
    requires: [],
    type: draft.type,
    version: draft.version,
  };
}

function createEmptySourceBundle(source: Source): SourceBundle {
  return parseSourceBundle({
    resources: sourceBundleResourcesSchema.parse({}),
    source,
  });
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  cancel: {
    en: "Cancel",
    it: "Annulla",
  },
  code: {
    en: "Code",
    it: "Codice",
  },
  create: {
    en: "Create",
    it: "Crea",
  },
  name: {
    en: "Name",
    it: "Nome",
  },
  type: {
    en: "Type",
    it: "Tipo",
  },
  version: {
    en: "Version",
    it: "Versione",
  },
};
