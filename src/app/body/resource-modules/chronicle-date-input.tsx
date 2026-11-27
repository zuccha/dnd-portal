import {
  Box,
  Input as ChakraInput,
  Text,
  type InputProps as ChakraInputProps,
} from "@chakra-ui/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { ChronicleDate } from "~/models/other/chronicle-date";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";

//------------------------------------------------------------------------------
// Chronicle Date Input Props
//------------------------------------------------------------------------------

type ChronicleDateInputProps = Omit<
  ChakraInputProps,
  "defaultValue" | "onBlur" | "onChange" | "onFocus" | "onKeyDown" | "value"
> & {
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (value: ChronicleDate | null) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  value: ChronicleDate | null;
};

//------------------------------------------------------------------------------
// Chronicle Date Input
//------------------------------------------------------------------------------

export default function ChronicleDateInput({
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  value,
  width,
  w,
  ...inputProps
}: ChronicleDateInputProps) {
  const { t } = useI18nLangContext(chronicleDateInputI18nContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activePart, setActivePart] = useState<DatePart>("era");
  const [draft, setDraft] = useState(() => chronicleDateToDraft(value, activePart, isFocused));
  const [caretOffset, setCaretOffset] = useState(0);
  const replacePartOnNextDigit = useRef(true);
  const inputWidth = width ?? w ?? "full";
  const mask = createDateMask(draft, t);

  useLayoutEffect(() => {
    setDraft(chronicleDateToDraft(value, activePart, isFocused));
  }, [activePart, isFocused, value]);

  useLayoutEffect(() => {
    if (!isFocused) return;
    const input = inputRef.current;
    if (!input) return;
    input.setSelectionRange(caretOffset, caretOffset);
  }, [caretOffset, isFocused, mask.text]);

  const selectPart = useCallback(
    (part: DatePart, cursorAtEnd = true, currentDraft = draft, allowIncomplete = false) => {
      const nextDraft = clearPartsAfterInvalidPart(currentDraft, activePart, part);
      if (nextDraft !== currentDraft) {
        setDraft(nextDraft);
        if (hasOnlyValidDraftValues(nextDraft)) onChange(draftToChronicleDate(nextDraft));
      }

      const selectableParts = getSelectableParts(nextDraft);
      const selectedPart =
        allowIncomplete || selectableParts.includes(part) ? part : selectableParts.at(-1)!;
      const nextMask = createDateMask(nextDraft, t);
      const segment = nextMask.segments[selectedPart];
      replacePartOnNextDigit.current = true;
      setActivePart(selectedPart);
      setCaretOffset(cursorAtEnd ? segment.end : segment.start);
    },
    [activePart, draft, onChange, t],
  );

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    selectPart(activePart, false);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const normalizedDraft = clearPartsAfterFirstIncomplete(draft);
    setDraft(normalizedDraft);
    onChange(draftToChronicleDate(normalizedDraft));
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const part = getPartAtOffset(mask.segments, input.selectionStart ?? 0, draft);
    selectPart(part, false);
  };

  const updatePart = useCallback(
    (part: DatePart, partValue: string) => {
      const nextDraft = { ...draft, [part]: partValue };
      setDraft(nextDraft);
      if (hasOnlyValidDraftValues(nextDraft)) onChange(draftToChronicleDate(nextDraft));
      return nextDraft;
    },
    [draft, onChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const selectableParts = getSelectableParts(draft);
    const currentIndex = dateParts.indexOf(activePart);
    const currentSegment = mask.segments[activePart];

    if (event.key === "Tab") {
      const nextIndex = currentIndex + (event.shiftKey ? -1 : 1);
      if (nextIndex < 0 || nextIndex >= dateParts.length) return;
      event.preventDefault();
      selectPart(dateParts[nextIndex]!, false, draft, !selectableParts.includes(activePart));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const offset = event.key === "ArrowLeft" ? -1 : 1;
      const nextIndex = Math.min(dateParts.length - 1, Math.max(0, currentIndex + offset));
      selectPart(
        dateParts[nextIndex]!,
        event.key === "ArrowRight",
        draft,
        !selectableParts.includes(activePart),
      );
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const currentValue = draft[activePart];
      const currentNumber = Number(currentValue);
      const delta = event.key === "ArrowUp" ? 1 : -1;
      const nextNumber = (Number.isFinite(currentNumber) ? currentNumber : 0) + delta;
      const minimum = getMinimumValue(activePart);
      const nextValue = String(minimum === undefined ? nextNumber : Math.max(minimum, nextNumber));
      updatePart(activePart, nextValue);
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      if (event.key === "Backspace" && !draft[activePart]) {
        const previousPart = dateParts[dateParts.indexOf(activePart) - 1];
        if (previousPart) selectPart(previousPart, true);
        return;
      }
      updatePart(activePart, "");
      return;
    }

    if (event.key === "-" && activePart === "era") {
      event.preventDefault();
      if (!draft.era.startsWith("-")) {
        replacePartOnNextDigit.current = false;
        updatePart("era", `-${draft.era}`);
      }
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const currentValue = draft[activePart];
      const maxDigits = getMaxDigits(activePart);
      const nextValue =
        replacePartOnNextDigit.current || currentValue.length >= maxDigits
          ? event.key
          : `${currentValue}${event.key}`;
      replacePartOnNextDigit.current = false;
      const nextDraft = updatePart(activePart, nextValue);

      if (nextValue.replace("-", "").length >= maxDigits) {
        const nextPart = dateParts[currentIndex + 1];
        if (nextPart) {
          selectPart(nextPart, false, nextDraft, !selectableParts.includes(activePart));
        }
      } else {
        const nextOffset = currentSegment.start + nextValue.length;
        setCaretOffset(nextOffset);
      }
      return;
    }

    if (event.key === "," || event.key === "-" || event.key === ":") {
      event.preventDefault();
      const nextPart = getNextPartForSeparator(event.key, activePart, selectableParts);
      if (nextPart) selectPart(nextPart, false);
      return;
    }

    if (event.key.length === 1) event.preventDefault();
  };

  return (
    <Box position="relative" w={inputWidth}>
      <Text
        aria-hidden
        alignItems="center"
        display="flex"
        inset={0}
        overflow="hidden"
        pointerEvents="none"
        position="absolute"
        fontFamily="inherit"
        fontSize="inherit"
        fontWeight="inherit"
        lineHeight="inherit"
        px="3"
        whiteSpace="pre"
        zIndex={0}
      >
        {mask.tokens.map((token, index) => {
          return (
            <Text
              as="span"
              bg={isFocused && token.part === activePart ? "colorPalette.emphasized" : undefined}
              color={token.part && isValidPart(token.part, draft[token.part]) ? "fg" : "fg.subtle"}
              key={index}
              rounded="sm"
            >
              {token.text}
            </Text>
          );
        })}
      </Text>
      <ChakraInput
        {...inputProps}
        aria-label={inputProps["aria-label"] ?? t("input_label")}
        bg="transparent"
        color="transparent"
        colorPalette="gray"
        onBlur={handleBlur}
        onChange={() => undefined}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        readOnly
        ref={inputRef}
        position="relative"
        value={mask.text}
        w={inputWidth}
        zIndex={1}
        _selection={{ bg: "transparent" }}
        caretColor="fg"
      />
    </Box>
  );
}

//------------------------------------------------------------------------------
// Date Part Types
//------------------------------------------------------------------------------

type DatePart = "era" | "year" | "month" | "day" | "hour" | "minute";

type DateMaskToken = {
  afterPart?: number;
  part?: DatePart;
  text: string;
};

//------------------------------------------------------------------------------
// Chronicle Date Input Translations
//------------------------------------------------------------------------------

const chronicleDateInputI18nContext = {
  era_prefix: { en: "Era ", it: "Era " },
  era_placeholder: { en: "e", it: "e" },
  input_label: { en: "Chronicle date", it: "Data cronologica" },
};

//------------------------------------------------------------------------------
// Date Parts
//------------------------------------------------------------------------------

const dateParts: DatePart[] = ["era", "year", "month", "day", "hour", "minute"];

//------------------------------------------------------------------------------
// Validate Draft Values
//------------------------------------------------------------------------------

function hasOnlyValidDraftValues(draft: Record<DatePart, string>) {
  return dateParts.every((part) => !draft[part] || isValidPart(part, draft[part]));
}

//------------------------------------------------------------------------------
// Convert Chronicle Date To Draft
//------------------------------------------------------------------------------

function chronicleDateToDraft(
  value: ChronicleDate | null,
  activePart: DatePart,
  isFocused: boolean,
): Record<DatePart, string> {
  return {
    day: formatDatePartForDraft("day", value?.day, activePart, isFocused),
    era: value?.era === null || value?.era === undefined ? "" : String(value.era),
    hour: formatDatePartForDraft("hour", value?.hour, activePart, isFocused),
    minute: formatDatePartForDraft("minute", value?.minute, activePart, isFocused),
    month: formatDatePartForDraft("month", value?.month, activePart, isFocused),
    year: value?.year === null || value?.year === undefined ? "" : String(value.year),
  };
}

//------------------------------------------------------------------------------
// Format Date Part For Draft
//------------------------------------------------------------------------------

function formatDatePartForDraft(
  part: DatePart,
  value: number | null | undefined,
  activePart: DatePart,
  isFocused: boolean,
) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return part !== activePart || !isFocused ? text.padStart(2, "0") : text;
}

//------------------------------------------------------------------------------
// Create Date Mask
//------------------------------------------------------------------------------

function createDateMask(draft: Record<DatePart, string>, t: (key: string) => string) {
  const values: Record<DatePart, string> = {
    day: draft.day || "dd",
    era: draft.era || t("era_placeholder"),
    hour: draft.hour || "hh",
    minute: draft.minute || "mm",
    month: draft.month || "mm",
    year: draft.year || "yyyy",
  };
  const prefix = t("era_prefix");
  const segments = {} as Record<DatePart, { end: number; start: number }>;
  const tokens: DateMaskToken[] = [{ afterPart: -1, text: prefix }];
  let text = prefix;

  for (const [index, part] of dateParts.entries()) {
    const start = text.length;
    text += values[part];
    segments[part] = { end: text.length, start };
    tokens.push({ part, text: values[part] });

    const separator = getSeparatorAfterPart(index);
    if (separator) {
      text += separator;
      tokens.push({ afterPart: index, text: separator });
    }
  }

  return { segments, text, tokens };
}

//------------------------------------------------------------------------------
// Get Separator After Part
//------------------------------------------------------------------------------

function getSeparatorAfterPart(index: number) {
  if (index === 0 || index === 3) return ", ";
  if (index === 1 || index === 2) return "-";
  if (index === 4) return ":";
  return "";
}

//------------------------------------------------------------------------------
// Get Selectable Parts
//------------------------------------------------------------------------------

function getSelectableParts(draft: Record<DatePart, string>) {
  const firstIncompleteIndex = dateParts.findIndex((part) => !isValidPart(part, draft[part]));
  return dateParts.slice(0, firstIncompleteIndex < 0 ? dateParts.length : firstIncompleteIndex + 1);
}

//------------------------------------------------------------------------------
// Get Part At Offset
//------------------------------------------------------------------------------

function getPartAtOffset(
  segments: Record<DatePart, { end: number; start: number }>,
  offset: number,
  draft: Record<DatePart, string>,
) {
  const selectableParts = getSelectableParts(draft);
  return (
    selectableParts.find(
      (part) => offset >= segments[part].start && offset <= segments[part].end,
    ) ?? selectableParts.at(-1)!
  );
}

//------------------------------------------------------------------------------
// Get Next Part For Separator
//------------------------------------------------------------------------------

function getNextPartForSeparator(
  separator: string,
  currentPart: DatePart,
  selectableParts: DatePart[],
) {
  const expectedNextPart: Partial<Record<DatePart, string>> = {
    day: ",",
    era: ",",
    hour: ":",
    month: "-",
    year: "-",
  };
  if (expectedNextPart[currentPart] !== separator) return undefined;
  return selectableParts[selectableParts.indexOf(currentPart) + 1];
}

//------------------------------------------------------------------------------
// Get Max Digits
//------------------------------------------------------------------------------

function getMaxDigits(part: DatePart) {
  return part === "era" || part === "year" ? Number.POSITIVE_INFINITY : 2;
}

//------------------------------------------------------------------------------
// Get Minimum Value
//------------------------------------------------------------------------------

function getMinimumValue(part: DatePart) {
  if (part === "era") return undefined;
  if (part === "month" || part === "day") return 1;
  return 0;
}

//------------------------------------------------------------------------------
// Validate Date Part
//------------------------------------------------------------------------------

function isValidPart(part: DatePart, value: string) {
  if (!value || value === "-") return false;
  const number = Number(value);
  if (!Number.isInteger(number)) return false;
  if (part === "month" || part === "day") return number > 0;
  if (part === "hour" || part === "minute" || part === "year") return number >= 0;
  return true;
}

//------------------------------------------------------------------------------
// Clear Parts After First Incomplete
//------------------------------------------------------------------------------

function clearPartsAfterFirstIncomplete(draft: Record<DatePart, string>) {
  const firstIncompleteIndex = dateParts.findIndex((part) => !isValidPart(part, draft[part]));
  if (firstIncompleteIndex < 0) return draft;

  return Object.fromEntries(
    dateParts.map((part, index) => [part, index >= firstIncompleteIndex ? "" : draft[part]]),
  ) as Record<DatePart, string>;
}

//------------------------------------------------------------------------------
// Clear Parts After Leaving An Incomplete Part
//------------------------------------------------------------------------------

function clearPartsAfterInvalidPart(
  draft: Record<DatePart, string>,
  leavingPart: DatePart,
  enteringPart: DatePart,
) {
  if (leavingPart === enteringPart || isValidPart(leavingPart, draft[leavingPart])) return draft;

  const leavingIndex = dateParts.indexOf(leavingPart);
  return Object.fromEntries(
    dateParts.map((part, index) => [part, index >= leavingIndex ? "" : draft[part]]),
  ) as Record<DatePart, string>;
}

//------------------------------------------------------------------------------
// Convert Draft To Chronicle Date
//------------------------------------------------------------------------------

function draftToChronicleDate(draft: Record<DatePart, string>): ChronicleDate | null {
  const values = Object.fromEntries(
    dateParts.map((part) => [part, isValidPart(part, draft[part]) ? Number(draft[part]) : null]),
  );
  const result = chronicleDateSchema.safeParse(values);
  if (!result.success) return null;
  return dateParts.every((part) => result.data[part] === null) ? null : result.data;
}
