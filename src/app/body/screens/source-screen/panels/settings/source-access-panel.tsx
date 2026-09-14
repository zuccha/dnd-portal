import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import {
  type RegistrySourceAccess,
  fetchRegistrySourceAccess,
  grantRegistrySourceAccess,
  revokeRegistrySourceAccess,
} from "~/models/registry/registry";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import IconButton from "~/ui/icon-button";
import TextInput from "~/ui/input";
import SectionHeading from "~/ui/section-heading";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Source Access Panel
//------------------------------------------------------------------------------

export default function SourceAccessPanel({ source }: { source: Source }) {
  const { t } = useI18nLangContext(i18nContext);
  const [accessList, setAccessList] = useState<RegistrySourceAccess[]>([]);
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<"read" | "write">("read");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const loadAccess = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setAccessList(await fetchRegistrySourceAccess(source.id));
    } catch (e) {
      console.error(e);
      setError("error.load_access");
    } finally {
      setLoading(false);
    }
  }, [source.id]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const grantAccess = async () => {
    if (!email.trim()) return;

    setSaving(true);
    setError(undefined);
    try {
      await grantRegistrySourceAccess(source.id, email.trim(), access);
      setEmail("");
      await loadAccess();
    } catch (e) {
      console.error(e);
      setError("error.save_access");
    } finally {
      setSaving(false);
    }
  };

  const revokeAccess = async (userId: string) => {
    setSaving(true);
    setError(undefined);
    try {
      await revokeRegistrySourceAccess(source.id, userId);
      await loadAccess();
    } catch (e) {
      console.error(e);
      setError("error.remove_access");
    } finally {
      setSaving(false);
    }
  };

  return (
    <VStack align="flex-start" gap={3} w="full">
      <SectionHeading>{t("access")}</SectionHeading>

      <HStack align="flex-end" flexWrap="wrap" gap={3} w="full">
        <CaptionInput caption={t("email")} flex={{ base: "1 1 100%", sm: 1 }} minW={0}>
          <TextInput
            disabled={saving}
            onValueChange={setEmail}
            placeholder={t("email_placeholder")}
            size="sm"
            type="email"
            value={email}
          />
        </CaptionInput>
        <CaptionInput caption={t("permission")} minW={{ base: "8rem", sm: "8rem" }}>
          <Select.Enum
            disabled={saving}
            onValueChange={setAccess}
            options={[
              { label: t("read"), value: "read" },
              { label: t("write"), value: "write" },
            ]}
            size="sm"
            value={access}
            w="full"
          />
        </CaptionInput>
        <Button disabled={saving || !email.trim()} loading={saving} onClick={grantAccess} size="sm">
          {t("grant")}
        </Button>
      </HStack>

      {error && (
        <Text color="fg.error" fontSize="sm">
          {t(error)}
        </Text>
      )}

      {!loading && accessList.length === 0 && (
        <Text color="fg.muted" fontSize="sm">
          {t("none")}
        </Text>
      )}

      {accessList.map((entry) => (
        <HStack
          borderColor="border"
          borderRadius="sm"
          borderWidth={1}
          justify="space-between"
          key={entry.user_id}
          px={3}
          py={2}
          w="full"
        >
          <Box minW={0}>
            <Text fontSize="sm" truncate>
              {entry.email}
            </Text>
            <Text color="fg.muted" fontSize="xs">
              {t(entry.access)}
            </Text>
          </Box>
          <IconButton
            Icon={XIcon}
            disabled={saving}
            label={t("remove")}
            onClick={() => revokeAccess(entry.user_id)}
            size="xs"
            variant="ghost"
          />
        </HStack>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "access": { en: "Accesses", it: "Accessi" },
  "email": { en: "Email", it: "Email" },
  "email_placeholder": { en: "user@example.com", it: "utente@esempio.com" },
  "error.load_access": {
    en: "Could not load access",
    it: "Impossibile caricare gli accessi",
  },
  "error.remove_access": {
    en: "Could not remove access",
    it: "Impossibile rimuovere l'accesso",
  },
  "error.save_access": {
    en: "Could not save access",
    it: "Impossibile salvare l'accesso",
  },
  "grant": { en: "Grant", it: "Concedi" },
  "none": { en: "No users have access", it: "Nessun utente ha accesso" },
  "permission": { en: "Permission", it: "Permesso" },
  "read": { en: "Viewer", it: "Lettore" },
  "remove": { en: "Remove", it: "Rimuovi" },
  "write": { en: "Editor", it: "Editor" },
};
