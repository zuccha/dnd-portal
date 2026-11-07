import { Span } from "@chakra-ui/react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import RichText, { type RichTextPattern } from "./rich-text";
import type { RichTextBlockPattern } from "./rich-text-block-pattern";

//------------------------------------------------------------------------------
// Rich Text Action Segment
//------------------------------------------------------------------------------

type RichTextActionSegment =
  | { kind: "attack"; mode: "melee" | "range" | "mixed"; modifier: string; values: string[] }
  | {
      kind: "label";
      label:
        | "any_outcome"
        | "failure"
        | "failure_1"
        | "failure_2"
        | "hit"
        | "response"
        | "success"
        | "trigger";
      value: string;
    }
  | { ability: string; condition?: string; dc: string; kind: "save" }
  | { kind: "text"; value: string };

//------------------------------------------------------------------------------
// Rich Text Action Block
//------------------------------------------------------------------------------

type RichTextActionBlockProps = {
  name: string;
  patterns: RichTextPattern[];
  segments: RichTextActionSegment[];
};

// eslint-disable-next-line react-refresh/only-export-components
function RichTextActionBlock({ name, patterns, segments }: RichTextActionBlockProps) {
  const { ti } = useI18nLangContext(actionLabels);

  return (
    <Span>
      <b>{name}.</b>{" "}
      {segments.map((segment, index) => (
        <Span key={index}>
          {index > 0 && " "}
          <RichText
            display="inline"
            patterns={patterns}
            text={renderSegment(segment, ti)}
            whiteSpace="pre-line"
          />
        </Span>
      ))}
    </Span>
  );
}

//------------------------------------------------------------------------------
// Render Segment
//------------------------------------------------------------------------------

function renderSegment(
  segment: RichTextActionSegment,
  ti: (key: string, ...args: string[]) => string,
): string {
  if (segment.kind === "attack") {
    if (segment.mode === "mixed") return ti("mixed", segment.modifier, ...segment.values);
    return ti(segment.mode, segment.modifier, segment.values[0]!);
  }
  if (segment.kind === "save") {
    return segment.condition
      ? ti("save_with_condition", segment.ability, segment.dc, segment.condition)
      : ti("save", segment.ability, segment.dc);
  }
  if (segment.kind === "label") return ti(segment.label, segment.value);
  return segment.value;
}

//------------------------------------------------------------------------------
// Create Rich Text Action Block Pattern
//------------------------------------------------------------------------------

export function createRichTextActionBlockPattern(
  patterns: RichTextPattern[],
): RichTextBlockPattern {
  return {
    regex: /^:::action [^\r\n]+\r?\n[\s\S]*?\r?\n:::[ \t]*(?=\r?\n|$)/m,
    render: (source) => {
      const parsed = parseActionBlock(source);
      return parsed ? <RichTextActionBlock {...parsed} patterns={patterns} /> : undefined;
    },
  };
}

//------------------------------------------------------------------------------
// Parse Action Block
//------------------------------------------------------------------------------

function parseActionBlock(source: string): Omit<RichTextActionBlockProps, "patterns"> | undefined {
  const match = /^:::action ([^\r\n]+)\r?\n([\s\S]*?)\r?\n:::[ \t]*$/.exec(source);
  if (!match) return undefined;

  const segments: RichTextActionSegment[] = [];
  const lines: string[] = [];
  for (const line of match[2]!.split(/\r?\n/)) {
    if (/^\s*@/.test(line)) {
      lines.push(line.trim());
    } else if (lines.length > 0) {
      lines[lines.length - 1] += `\n${line}`;
    } else if (line.trim()) {
      return undefined;
    }
  }

  for (const line of lines) {
    const lineMatch = /^(\S+)\s+([\s\S]+)$/.exec(line.trim());
    const label = lineMatch?.[1];
    const value = lineMatch?.[2]?.trim();
    if (!label || !value) return undefined;

    if (label === "@melee" || label === "@range" || label === "@mixed") {
      const values = value.split("||").map((part) => part.trim());
      const expected = label === "@mixed" ? 3 : 2;
      if (values.length !== expected || values.some((part) => !part)) return undefined;
      segments.push({
        kind: "attack",
        mode: label.slice(1) as "melee" | "range" | "mixed",
        modifier: values[0]!,
        values: values.slice(1),
      });
      continue;
    }

    if (label === "@save") {
      const [ability, dc, ...condition] = value.split("||").map((part) => part.trim());
      if (!ability || !dc || condition.length > 1) return undefined;
      segments.push({ kind: "save", ability, condition: condition[0], dc });
      continue;
    }

    if (
      [
        "@any_outcome",
        "@failure",
        "@failure_1",
        "@failure_2",
        "@hit",
        "@response",
        "@success",
        "@trigger",
      ].includes(label)
    ) {
      segments.push({
        kind: "label",
        label: label.slice(1) as
          | "any_outcome"
          | "failure"
          | "failure_1"
          | "failure_2"
          | "hit"
          | "response"
          | "success"
          | "trigger",
        value,
      });
      continue;
    }

    if (label === "@text") {
      segments.push({ kind: "text", value });
      continue;
    }

    return undefined;
  }

  return segments.length ? { name: match[1]!, segments } : undefined;
}

//------------------------------------------------------------------------------
// Action Labels
//------------------------------------------------------------------------------

const actionLabels: Record<string, Record<string, string>> = {
  any_outcome: {
    en: "__Failure or Success:__ <1>",
    it: "__Fallimento o Successo:__ <1>",
  },
  failure: {
    en: "__Failure:__ <1>",
    it: "__Fallimento:__ <1>",
  },
  failure_1: {
    en: "__First Failure:__ <1>",
    it: "__Primo Fallimento:__ <1>",
  },
  failure_2: {
    en: "__Second Failure:__ <1>",
    it: "__Secondo Fallimento:__ <1>",
  },
  hit: {
    en: "__Hit:__ <1>.",
    it: "__Colpito:__ <1>.",
  },
  melee: {
    en: "__Melee Attack Roll:__ <1>, reach <2>.",
    it: "__Tiro per colpire in mischia:__ <1>, portata <2>.",
  },
  mixed: {
    en: "__Melee or Ranged Attack Roll:__ <1>, reach <2> or range <3>.",
    it: "__Tiro per colpire in mischia o a distanza:__ <1>, portata <2> o gittata <3>.",
  },
  range: {
    en: "__Ranged Attack Roll:__ <1>, range <2>.",
    it: "__Tiro per colpire a distanza:__ <1>, gittata <2>.",
  },
  response: {
    en: "__Response:__ <1>",
    it: "__Esito:__ <1>",
  },
  save: {
    en: "__<1> Saving Throw:__ DC <2>.",
    it: "__Tiro salvezza su <1>:__ CD <2>.",
  },
  save_with_condition: {
    en: "__<1> Saving Throw:__ DC <2>, <3>",
    it: "__Tiro salvezza su <1>:__ CD <2>, <3>",
  },
  success: {
    en: "__Success:__ <1>",
    it: "__Successo:__ <1>",
  },
  trigger: {
    en: "__Trigger:__ <1>",
    it: "__Attivazione:__ <1>",
  },
};

//------------------------------------------------------------------------------
// Use Rich Text Action Block Preprocessor
//------------------------------------------------------------------------------

export function useRichTextActionBlockPreprocessor() {
  const { ti } = useI18nLangContext(actionLabels);

  return useCallback(
    (text: string) =>
      text.replace(/^:::action [^\r\n]+\r?\n[\s\S]*?\r?\n:::[ \t]*(?=\r?\n|$)/gm, (source) => {
        const parsed = parseActionBlock(source);
        if (!parsed) return source;

        return `**${parsed.name}.** ${parsed.segments.map((segment) => renderSegment(segment, ti)).join(" ")}`;
      }),
    [ti],
  );
}
