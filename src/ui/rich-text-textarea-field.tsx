import { HStack, Text, type StackProps } from "@chakra-ui/react";
import {
  ArrowLeftRightIcon,
  BetweenHorizontalEndIcon,
  BoldIcon,
  Heading2Icon,
  ItalicIcon,
  Link2Icon,
  Table2Icon,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import Field from "~/ui/field";
import IconButton from "~/ui/icon-button";
import Textarea, { type TextareaProps } from "~/ui/textarea";
import {
  richTextBoldDelimiter,
  richTextHeadingDelimiter,
  richTextItalicDelimiter,
} from "./rich-text-page";
import { richTextPageBreakDelimiter } from "./rich-text-page-break";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Format
//------------------------------------------------------------------------------

type RichTextFormat = "bold" | "header" | "italic" | "metric_imperial" | "page_break" | "table";

//------------------------------------------------------------------------------
// Rich Text Textarea Props
//------------------------------------------------------------------------------

export type RichTextTextareaFieldProps = TextareaProps & {
  error?: string;
  fieldProps?: StackProps;
  label: ReactNode;
  onLinkRequest?: (insertText: (text: string) => void, fallback: string) => void;
};

//------------------------------------------------------------------------------
// Rich Text Textarea
//------------------------------------------------------------------------------

export default function RichTextTextareaField(props: RichTextTextareaFieldProps) {
  const { error, fieldProps, label, onLinkRequest, onValueChange, ...textareaProps } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18nLangContext(i18nContext);
  const isMac = isMacOS();
  const shortcutModifier = isMac ? "⌘" : "Ctrl";
  const shortcutAlt = isMac ? "⌥" : "Alt";

  const insertTextAtSelection = useCallback(
    (text: string, start: number, end: number, selectionStart: number, selectionEnd: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(start, end);
      const inserted = document.execCommand("insertText", false, text);
      if (!inserted) {
        textarea.setRangeText(text, start, end, "end");
        onValueChange(textarea.value);
      }
      textarea.setSelectionRange(selectionStart, selectionEnd);
    },
    [onValueChange],
  );

  const formatSelection = useCallback(
    (format: RichTextFormat) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionEnd, selectionStart, value } = textarea;
      const selectedText = value.slice(selectionStart, selectionEnd);
      let nextSelectionStart = selectionStart;
      let nextSelectionEnd = selectionEnd;
      let replacement: string;
      let replaceStart = selectionStart;
      let replaceEnd = selectionEnd;

      if (format === "table") {
        const tableName = t("table_name");
        const prefix =
          selectionStart > 0 && !/[\r\n]$/.test(value.slice(0, selectionStart)) ? "\n\n" : "";
        const suffix =
          selectionEnd < value.length && !/^[\r\n]/.test(value.slice(selectionEnd)) ? "\n\n" : "";
        const table = `:::table ${tableName}\nHeader 1 || Header 2\n--- || ---\nCell 1 || Cell 2\n:::`;
        replacement = `${prefix}${table}${suffix}`;
        const nameStart = selectionStart + prefix.length + ":::table ".length;
        nextSelectionStart = nameStart;
        nextSelectionEnd = nameStart + tableName.length;
      } else if (format === "page_break") {
        replacement = `${richTextPageBreakDelimiter}`;
        nextSelectionStart = selectionStart + replacement.length;
        nextSelectionEnd = nextSelectionStart;
      } else if (format === "metric_imperial") {
        const replacementText = metImpMappings[selectedText] ?? `${selectedText}|${selectedText}`;
        replacement = `{{${replacementText}}}`;
        nextSelectionStart = selectionStart + 2;
        nextSelectionEnd = nextSelectionStart + replacementText.indexOf("|");
      } else {
        const delimiter =
          format === "bold"
            ? richTextBoldDelimiter
            : format === "italic"
              ? richTextItalicDelimiter
              : richTextHeadingDelimiter;
        const alreadyFormatted =
          value.slice(0, selectionStart).endsWith(delimiter) &&
          value.slice(selectionEnd).startsWith(delimiter);

        if (alreadyFormatted) {
          replaceStart -= delimiter.length;
          replaceEnd += delimiter.length;
          replacement = selectedText;
          nextSelectionStart = replaceStart;
          nextSelectionEnd = replaceStart + selectedText.length;
        } else {
          replacement = `${delimiter}${selectedText}${delimiter}`;
          nextSelectionStart = selectionStart + delimiter.length;
          nextSelectionEnd = nextSelectionStart + selectedText.length;
        }
      }

      insertTextAtSelection(
        replacement,
        replaceStart,
        replaceEnd,
        nextSelectionStart,
        nextSelectionEnd,
      );
    },
    [insertTextAtSelection, t],
  );

  const requestLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !onLinkRequest) return;

    const { selectionEnd, selectionStart, value } = textarea;
    const fallback = value.slice(selectionStart, selectionEnd);
    const insertText = (text: string) => {
      insertTextAtSelection(
        text,
        selectionStart,
        selectionEnd,
        selectionStart + text.length,
        selectionStart + text.length,
      );
    };
    onLinkRequest(insertText, fallback);
  }, [insertTextAtSelection, onLinkRequest]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing || !(event.metaKey || event.ctrlKey)) return;

      if (event.altKey && event.code === "KeyL" && onLinkRequest) {
        event.preventDefault();
        requestLink();
        return;
      }

      let format: RichTextFormat | undefined;

      switch (event.code) {
        case "KeyB":
          if (!event.altKey) format = "bold";
          break;
        case "KeyI":
          format = event.altKey ? "header" : "italic";
          break;
        case "KeyM":
          if (event.altKey) format = "metric_imperial";
          break;
      }

      if (!format) return;
      event.preventDefault();
      formatSelection(format);
    },
    [formatSelection, onLinkRequest, requestLink],
  );

  const handleToolbarMouseDown = useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  return (
    <Field
      error={error}
      label={
        <HStack gap={1} w="full">
          <Text flex={1}>{label}</Text>
          <HStack gap={0.5}>
            <IconButton
              Icon={BoldIcon}
              label={`${t("bold")} (${shortcutModifier}+B)`}
              onClick={() => formatSelection("bold")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
            <IconButton
              Icon={ItalicIcon}
              label={`${t("italic")} (${shortcutModifier}+I)`}
              onClick={() => formatSelection("italic")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
            <IconButton
              Icon={Heading2Icon}
              label={`${t("header")} (${shortcutModifier}+${shortcutAlt}+I)`}
              onClick={() => formatSelection("header")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
            <IconButton
              Icon={ArrowLeftRightIcon}
              label={`${t("metric_imperial")} (${shortcutModifier}+${shortcutAlt}+M)`}
              onClick={() => formatSelection("metric_imperial")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
            {onLinkRequest && (
              <IconButton
                Icon={Link2Icon}
                label={`${t("link_resource")} (${shortcutModifier}+${shortcutAlt}+L)`}
                onClick={requestLink}
                onMouseDown={handleToolbarMouseDown}
                rounded="sm"
                size="xs"
                variant="ghost"
              />
            )}
            <IconButton
              Icon={BetweenHorizontalEndIcon}
              label={t("page_break")}
              onClick={() => formatSelection("page_break")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
            <IconButton
              Icon={Table2Icon}
              label={t("table")}
              onClick={() => formatSelection("table")}
              onMouseDown={handleToolbarMouseDown}
              rounded="sm"
              size="xs"
              variant="ghost"
            />
          </HStack>
        </HStack>
      }
      gap={0}
      {...fieldProps}
    >
      <Textarea
        {...textareaProps}
        onKeyDown={handleKeyDown}
        onValueChange={onValueChange}
        ref={textareaRef}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  bold: {
    en: "Bold",
    it: "Grassetto",
  },
  header: {
    en: "Heading",
    it: "Intestazione",
  },
  italic: {
    en: "Italic",
    it: "Corsivo",
  },
  link_resource: {
    en: "Link a resource",
    it: "Collega una risorsa",
  },
  metric_imperial: {
    en: "Metric/imperial",
    it: "Metrico/imperiale",
  },
  page_break: {
    en: "Insert page break",
    it: "Inserisci interruzione di pagina",
  },
  table: {
    en: "Insert table",
    it: "Inserisci tabella",
  },
  table_name: {
    en: "Table name",
    it: "Nome tabella",
  },
};

//------------------------------------------------------------------------------
// Is macOS
//------------------------------------------------------------------------------

function isMacOS(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}

//------------------------------------------------------------------------------
// Met Imp Mappings
//------------------------------------------------------------------------------

const metImpMappings: Record<string, string> = {
  "5 feet": "1.5 meters|5 feet",
  "10 feet": "3 meters|10 feet",
  "15 feet": "4.5 meters|15 feet",
  "20 feet": "6 meters|20 feet",
  "25 feet": "7.5 meters|25 feet",
  "30 feet": "9 meters|30 feet",
  "60 feet": "18 meters|60 feet",
  "120 feet": "36 meters|120 feet",

  "5 piedi": "1.5 metri|5 piedi",
  "10 piedi": "3 metri|10 piedi",
  "15 piedi": "4.5 metri|15 piedi",
  "20 piedi": "6 metri|20 piedi",
  "25 piedi": "7.5 metri|25 piedi",
  "30 piedi": "9 metri|30 piedi",
  "60 piedi": "18 metri|60 piedi",
  "120 piedi": "36 metri|120 piedi",

  "1.5 meters": "1.5 meters|5 feet",
  "3 meters": "3 meters|10 feet",
  "4.5 meters": "4.5 meters|15 feet",
  "6 meters": "6 meters|20 feet",
  "7.5 meters": "7.5 meters|25 feet",
  "9 meters": "9 meters|30 feet",
  "18 meters": "18 meters|60 feet",
  "36 meters": "36 meters|120 feet",

  "1,5 metri": "1.5 metri|5 piedi",
  "3 metri": "3 metri|10 piedi",
  "4,5 metri": "4.5 metri|15 piedi",
  "6 metri": "6 metri|20 piedi",
  "7,5 metri": "7.5 metri|25 piedi",
  "9 metri": "9 metri|30 piedi",
  "18 metri": "18 metri|60 piedi",
  "36 metri": "36 metri|120 piedi",

  "5-foot": "1.5-meter|5-foot",
  "10-foot": "3-meter|10 foot",
  "15-foot": "4.5-meter|15-foot",
  "20-foot": "6-meter|20-foot",
  "25-foot": "7.5-meter|25-foot",
  "30-foot": "9-meter|30-foot",
  "60-foot": "18-meter|60-foot",
  "120-foot": "36-meter|120-foot",
};
