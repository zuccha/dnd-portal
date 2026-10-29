import { HStack, Text, type StackProps } from "@chakra-ui/react";
import { ArrowLeftRightIcon, BoldIcon, Heading2Icon, ItalicIcon, Link2Icon } from "lucide-react";
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
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Format
//------------------------------------------------------------------------------

type RichTextFormat = "bold" | "header" | "italic" | "metric_imperial";

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

      if (format === "metric_imperial") {
        replacement = `{{${selectedText}|${selectedText}}}`;
        nextSelectionStart = selectionStart + (selectedText ? selectedText.length + 2 : 1);
        nextSelectionEnd = nextSelectionStart + selectedText.length;
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
    [insertTextAtSelection],
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
  metric_imperial: {
    en: "Metric/imperial",
    it: "Metrico/imperiale",
  },
  link_resource: {
    en: "Link a resource",
    it: "Collega una risorsa",
  },
};

//------------------------------------------------------------------------------
// Is macOS
//------------------------------------------------------------------------------

function isMacOS(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
}
