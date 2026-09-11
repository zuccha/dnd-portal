import {
  Badge,
  Box,
  CloseButton,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source, SourceDependency } from "~/models/catalogue/source";
import Button from "~/ui/button";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Dependencies Dialog Props
//------------------------------------------------------------------------------

type SourceDependenciesDialogProps = {
  missingDependencies: SourceDependency[];
  onCancel: () => void;
  onContinue: () => void;
  onDownload: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  registryDependencies: Source[];
  source: Source;
};

//------------------------------------------------------------------------------
// Source Dependencies Dialog
//------------------------------------------------------------------------------

export default function SourceDependenciesDialog({
  missingDependencies,
  onCancel,
  onContinue,
  onDownload,
  onOpenChange,
  open,
  registryDependencies,
  source,
}: SourceDependenciesDialogProps) {
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const sourceName = source.name[lang] || source.code;

  return (
    <Dialog.Root
      onOpenChange={({ open: nextOpen }) => {
        onOpenChange(nextOpen);
        if (!nextOpen) onCancel();
      }}
      open={open}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{t("dependencies.title")}</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack align="flex-start" gap={4}>
                <Text color="fg.muted" fontSize="sm">
                  {ti("dependencies.description", sourceName)}
                </Text>

                {registryDependencies.length > 0 && (
                  <VStack align="flex-start" gap={2} w="full">
                    <Text fontWeight="semibold">
                      {t("dependencies.repository")}
                    </Text>
                    <VStack align="stretch" gap={1} w="full">
                      {registryDependencies.map((dependency) => (
                        <Box
                          borderColor="border"
                          borderRadius="sm"
                          borderWidth={1}
                          key={dependency.id}
                          px={3}
                          py={2}
                        >
                          <Text fontSize="sm">
                            {dependency.name[lang] || dependency.code}
                          </Text>
                          <Text color="fg.muted" fontSize="xs">
                            {dependency.code}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </VStack>
                )}

                {missingDependencies.length > 0 && (
                  <VStack align="flex-start" gap={2} w="full">
                    <Text fontWeight="semibold">
                      {t("dependencies.missing")}
                    </Text>
                    <Box
                      bgColor="bg.subtle"
                      borderColor="border"
                      borderRadius="sm"
                      borderWidth={1}
                      px={3}
                      py={2}
                      w="full"
                    >
                      <Text color="fg.muted" fontSize="sm">
                        {t("dependencies.missing_description")}
                      </Text>
                      <VStack align="flex-start" gap={1} mt={2}>
                        {missingDependencies.map((dependency) => (
                          <Badge
                            colorPalette="orange"
                            key={dependency.source_id}
                            size="sm"
                            variant="subtle"
                          >
                            {dependency.name[lang] || dependency.code}
                          </Badge>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                )}

                <Text color="fg.muted" fontSize="sm">
                  {t("dependencies.continue_description")}
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              alignItems="stretch"
              flexDirection={{ base: "column", sm: "row" }}
              flexWrap="wrap"
              gap={2}
              justifyContent="flex-end"
              w="full"
            >
              <Button
                onClick={onCancel}
                variant="outline"
                w={{ base: "full", sm: "auto" }}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={onContinue}
                variant="outline"
                w={{ base: "full", sm: "auto" }}
              >
                {t("dependencies.continue")}
              </Button>
              {registryDependencies.length > 0 && (
                <Button onClick={onDownload} w={{ base: "full", sm: "auto" }}>
                  {t("dependencies.download")}
                </Button>
              )}
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
