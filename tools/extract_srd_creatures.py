#!/usr/bin/env python3
"""Extract creature stat blocks from the SRD creature PDFs.

Ghostscript is used for its text XML output because the PDFs contain positioned
text but are not reliably extractable in reading order with plain text output.
The script intentionally emits an intermediate JSON file before writing a
bundle, so parsing errors can be inspected without losing the source bundle.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import tempfile
import uuid
import xml.etree.ElementTree as ElementTree
from dataclasses import dataclass
from pathlib import Path
from collections import defaultdict, deque
from typing import Any, Iterable


#------------------------------------------------------------------------------
# Constants
#------------------------------------------------------------------------------

CREATURE_NAMESPACE = uuid.UUID("7d8c58c1-20a8-4dcb-aeb5-cd04a2cbbd63")
RESOURCE_KINDS = (
    "armors",
    "items",
    "tools",
    "weapons",
    "languages",
)

ENGLISH_SIZES = ("Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan")
ITALIAN_SIZES = (
    "Minuscola",
    "Minuscolo",
    "Piccola",
    "Piccolo",
    "Media",
    "Medio",
    "Grande",
    "Enorme",
    "Mastodontica",
    "Mastodontico",
)

ENGLISH_TYPES = (
    "Aberration",
    "Beast",
    "Celestial",
    "Construct",
    "Dragon",
    "Elemental",
    "Fey",
    "Fiend",
    "Giant",
    "Humanoid",
    "Monstrosity",
    "Ooze",
    "Plant",
    "Swarm",
    "Undead",
)

ITALIAN_TYPES = (
    "Aberrazione",
    "Bestia",
    "Celestiale",
    "Costrutto",
    "Drago",
    "Elementale",
    "Fata",
    "Folletto",
    "Immondo",
    "Gigante",
    "Umanoide",
    "Mostruosità",
    "Melma",
    "Pianta",
    "Sciame",
    "Vegetale",
    "Non morto",
)

ENGLISH_TYPE_VALUES = {
    "Aberration": "aberration",
    "Beast": "beast",
    "Celestial": "celestial",
    "Construct": "construct",
    "Dragon": "dragon",
    "Elemental": "elemental",
    "Fey": "fey",
    "Fiend": "fiend",
    "Giant": "giant",
    "Humanoid": "humanoid",
    "Monstrosity": "monstrosity",
    "Ooze": "ooze",
    "Plant": "plant",
    "Swarm": "beast",
    "Undead": "undead",
}

ITALIAN_TYPE_VALUES = {
    "Aberrazione": "aberration",
    "Bestia": "beast",
    "Celestiale": "celestial",
    "Costrutto": "construct",
    "Drago": "dragon",
    "Elementale": "elemental",
    "Fata": "fey",
    "Folletto": "fey",
    "Gigante": "giant",
    "Immondo": "fiend",
    "Melma": "ooze",
    "Mostruosità": "monstrosity",
    "Non morto": "undead",
    "Pianta": "plant",
    "Sciame": "beast",
    "Umanoide": "humanoid",
    "Vegetale": "plant",
}

ABILITY_NAMES = {
    "str": "str",
    "for": "str",
    "dex": "dex",
    "des": "dex",
    "con": "con",
    "cos": "con",
    "int": "int",
    "wis": "wis",
    "sag": "wis",
    "cha": "cha",
    "car": "cha",
}

ABILITY_FULL_NAMES = {
    "str": "strength",
    "dex": "dexterity",
    "con": "constitution",
    "int": "intelligence",
    "wis": "wisdom",
    "cha": "charisma",
}

SKILL_NAMES = {
    "acrobatics": "acrobatics",
    "acrobazia": "acrobatics",
    "animal handling": "animal_handling",
    "addestrare animali": "animal_handling",
    "arcana": "arcana",
    "arcano": "arcana",
    "athletics": "athletics",
    "atletica": "athletics",
    "deception": "deception",
    "inganno": "deception",
    "history": "history",
    "storia": "history",
    "insight": "insight",
    "intuizione": "insight",
    "intimidation": "intimidation",
    "intimidire": "intimidation",
    "investigation": "investigation",
    "indagare": "investigation",
    "medicine": "medicine",
    "medicina": "medicine",
    "nature": "nature",
    "natura": "nature",
    "perception": "perception",
    "percezione": "perception",
    "performance": "performance",
    "intrattenere": "performance",
    "persuasion": "persuasion",
    "persuasione": "persuasion",
    "religion": "religion",
    "religione": "religion",
    "sleight of hand": "sleight_of_hand",
    "rapidità di mano": "sleight_of_hand",
    "stealth": "stealth",
    "furtività": "stealth",
    "survival": "survival",
    "sopravvivenza": "survival",
}

DAMAGE_NAMES = {
    "acid": "acid",
    "acido": "acid",
    "bludgeoning": "bludgeoning",
    "contundente": "bludgeoning",
    "contundenti": "bludgeoning",
    "cold": "cold",
    "freddo": "cold",
    "fire": "fire",
    "fuoco": "fire",
    "force": "force",
    "forza": "force",
    "lightning": "lightning",
    "fulmine": "lightning",
    "necrotic": "necrotic",
    "necrotico": "necrotic",
    "necrotici": "necrotic",
    "piercing": "piercing",
    "perforante": "piercing",
    "perforanti": "piercing",
    "poison": "poison",
    "veleno": "poison",
    "psychic": "psychic",
    "psichico": "psychic",
    "psichici": "psychic",
    "radiant": "radiant",
    "radioso": "radiant",
    "radiosi": "radiant",
    "slashing": "slashing",
    "tagliente": "slashing",
    "taglienti": "slashing",
    "thunder": "thunder",
    "tuono": "thunder",
}

CONDITION_NAMES = {
    "blinded": "blinded",
    "accecato": "blinded",
    "charmed": "charmed",
    "affascinato": "charmed",
    "deafened": "deafened",
    "assordato": "deafened",
    "exhaustion": "exhaustion",
    "indebolimento": "exhaustion",
    "frightened": "frightened",
    "spaventato": "frightened",
    "grappled": "grappled",
    "afferrato": "grappled",
    "incapacitated": "incapacitated",
    "incapacitato": "incapacitated",
    "paralyzed": "paralyzed",
    "paralizzato": "paralyzed",
    "petrified": "petrified",
    "pietrificato": "petrified",
    "poisoned": "poisoned",
    "avvelenato": "poisoned",
    "prone": "prone",
    "prono": "prone",
    "restrained": "restrained",
    "trattenuto": "restrained",
    "stunned": "stunned",
    "stordito": "stunned",
    "unconscious": "unconscious",
    "privo di sensi": "unconscious",
}

KNOWN_CREATURE_TRANSLATIONS = {
    "air elemental": "elementale dell aria",
    "baboon": "babbuino",
    "bat": "pipistrello",
    "black bear": "orso nero",
    "cat": "gatto",
    "cultist fanatic": "cultista fanatico",
    "druid": "druido",
    "frog": "rana",
    "ghoul": "ghoul",
    "giant goat": "capra gigante",
    "hawk": "falco",
    "jackal": "sciacallo",
    "mule": "mulo",
    "octopus": "piovra",
    "panther": "pantera",
    "piranha": "piranha",
    "pony": "pony",
    "pteranodon": "pteranodonte",
    "raven": "corvo",
    "sal amander": "salamandra",
    "salamander": "salamandra",
    "scorpion": "scorpione",
    "seahorse": "cavalluccio marino",
    "specter": "spettro",
    "spider": "ragno",
    "swarm of insects": "sciame di insetti",
    "swarm of ravens": "stormo di corvi",
    "warhorse": "cavallo da guerra",
    "weasel": "faina",
    "wolf": "lupo",
    "young gold dragon": "drago d oro giovane",
    "young red dragon": "drago rosso giovane",
}

SECTION_NAMES = {
    "Traits",
    "Actions",
    "Bonus Actions",
    "Reactions",
    "Legendary Actions",
    "Lair Actions",
    "Tratti",
    "Azioni",
    "Azioni bonus",
    "Reazioni",
    "Azioni leggendarie",
    "Azioni della tana",
}


#------------------------------------------------------------------------------
# Data types
#------------------------------------------------------------------------------

@dataclass(frozen=True)
class TextLine:
    page: int
    column: int
    y: float
    text: str
    bold: bool


@dataclass
class CreatureBlock:
    language: str
    page: int
    column: int
    name: str
    descriptor: str
    lines: list[TextLine]


@dataclass
class ParsedCreature:
    language: str
    name: str
    descriptor: str
    page: int
    size: str
    type: str
    alignment: str
    ac: int
    initiative: int
    hp: int
    hp_formula: str
    cr: float
    exp: int
    pb: int
    abilities: dict[str, int]
    ability_saves: dict[str, int]
    skills: dict[str, int]
    lines: list[str]
    sections: dict[str, str]
    language_names: list[str]
    language_scope: str
    language_mode: str
    language_additional_count: int
    resistance_text: str
    immunity_text: str
    vulnerability_text: str
    sense_text: str
    speed_text: str
    equipment_names: list[str]


#------------------------------------------------------------------------------
# XML extraction
#------------------------------------------------------------------------------

def _decode_xml_text(value: str) -> str:
    return re.sub(
        r"&#x[0-9A-Fa-f]+;",
        lambda match: html.unescape(match.group(0)),
        value,
    )


def _sanitize_xml(value: str) -> str:
    value = re.sub(r"&#x(?:0*0?[0-8B-C]|0*D);", "", value, flags=re.IGNORECASE)
    return _decode_xml_text(value)


def _span_text(span: ElementTree.Element) -> str:
    return "".join(
        html.unescape(char.attrib.get("c", "")) for char in span.findall("./char")
    )


def _extract_page_lines(path: Path, language: str, page: int) -> list[TextLine]:
    root = ElementTree.fromstring(_sanitize_xml(path.read_text(errors="replace")))
    columns: list[list[TextLine]] = [[], []]

    for line in root.findall(".//line"):
        spans: list[tuple[float, float, str, bool]] = []
        for span in line.findall("./span"):
            bbox = span.attrib.get("bbox", "").split()
            if len(bbox) < 4:
                continue
            text = _span_text(span)
            if not text:
                continue
            spans.append(
                (
                    float(bbox[0]),
                    float(bbox[1]),
                    text,
                    "Bold" in span.attrib.get("font", ""),
                )
            )

        if not spans:
            continue

        x = min(span[0] for span in spans)
        y = min(span[1] for span in spans)
        text = re.sub(r"[ \t]+", " ", "".join(span[2] for span in sorted(spans))).strip()
        if not text:
            continue

        column = 0 if x < 290 else 1
        columns[column].append(
            TextLine(
                page=page,
                column=column,
                y=y,
                text=text,
                bold=any(span[3] for span in spans),
            )
        )

    return [line for column in columns for line in sorted(column, key=lambda item: item.y)]


def _extract_lines(pdf: Path, language: str) -> list[TextLine]:
    with tempfile.TemporaryDirectory(prefix="srd-creatures-") as directory:
        output_directory = Path(directory)
        subprocess.run(
            [
                "gs",
                "-q",
                "-dNOPAUSE",
                "-dBATCH",
                "-sDEVICE=txtwrite",
                "-dTextFormat=1",
                f"-sOutputFile={output_directory / 'page-%04d.xml'}",
                str(pdf),
            ],
            check=True,
        )

        lines: list[TextLine] = []
        for page_path in sorted(output_directory.glob("page-*.xml")):
            page = int(page_path.stem.split("-")[-1])
            lines.extend(_extract_page_lines(page_path, language, page))
        return lines


#------------------------------------------------------------------------------
# Block detection
#------------------------------------------------------------------------------

def _is_english_descriptor(text: str) -> bool:
    return (
        text.startswith(ENGLISH_SIZES)
        and any(re.search(rf"\b{re.escape(creature_type)}\b", text) for creature_type in ENGLISH_TYPES)
        and "," in text
    )


def _is_italian_descriptor(text: str) -> bool:
    return (
        any(re.search(rf"\b{re.escape(creature_type)}\b", text) for creature_type in ITALIAN_TYPES)
        and any(re.search(rf"\b{re.escape(size)}\b", text) for size in ITALIAN_SIZES)
        and "," in text
    )


def _is_noise(text: str, language: str) -> bool:
    if not text:
        return True
    if text.isdigit():
        return True
    if "System Reference Document" in text:
        return True
    if text in {"Monsters A–Z", "Mostri A–Z"}:
        return True
    return False


def _merge_lines(lines: Iterable[TextLine]) -> list[TextLine]:
    merged: list[TextLine] = []
    for line in lines:
        if merged and merged[-1].page == line.page and merged[-1].column == line.column and abs(merged[-1].y - line.y) < 0.5:
            previous = merged[-1]
            merged[-1] = TextLine(
                page=previous.page,
                column=previous.column,
                y=previous.y,
                text=previous.text + line.text,
                bold=previous.bold or line.bold,
            )
        else:
            merged.append(line)
    return merged


def _find_name(lines: list[TextLine], index: int) -> str:
    for previous in reversed(lines[:index]):
        if not _is_noise(previous.text, "") and previous.text not in SECTION_NAMES:
            return previous.text
    return ""


def _extract_blocks(lines: list[TextLine], language: str) -> list[CreatureBlock]:
    lines = _merge_lines(lines)
    is_descriptor = _is_english_descriptor if language == "en" else _is_italian_descriptor
    starts = [index for index, line in enumerate(lines) if is_descriptor(line.text)]
    blocks: list[CreatureBlock] = []

    for position, descriptor_index in enumerate(starts):
        next_descriptor = starts[position + 1] if position + 1 < len(starts) else len(lines)
        descriptor = lines[descriptor_index]
        name = _find_name(lines, descriptor_index)
        body = [line for line in lines[descriptor_index + 1 : next_descriptor] if not _is_noise(line.text, language)]
        next_name = _find_name(lines, next_descriptor) if next_descriptor < len(lines) else ""
        while body and body[-1].text == next_name:
            body.pop()
        blocks.append(
            CreatureBlock(
                language=language,
                page=descriptor.page,
                column=descriptor.column,
                name=name,
                descriptor=descriptor.text,
                lines=body,
            )
        )

    return blocks


#------------------------------------------------------------------------------
# Stat block parsing
#------------------------------------------------------------------------------

def _parse_int(value: str, default: int = 0) -> int:
    value = value.replace("−", "-").replace("–", "-").strip()
    match = re.search(r"[-+]?\d+", value)
    return int(match.group(0)) if match else default


def _parse_number(value: str, default: float = 0) -> float:
    value = value.replace("−", "-").replace(",", ".").strip()
    match = re.search(r"[-+]?\d+(?:\.\d+)?", value)
    return float(match.group(0)) if match else default


def _parse_cr(value: str) -> float:
    value = value.strip().replace("⅛", "1/8").replace("¼", "1/4").replace("½", "1/2")
    if "/" in value:
        numerator, denominator = value.split("/", 1)
        return _parse_number(numerator) / _parse_number(denominator, 1)
    return _parse_number(value)


def _feet_or_meters_to_cm(value: str, language: str) -> int:
    amount = _parse_number(value)
    return round(amount * (30 if language == "en" else 100))


def _reflow(lines: Iterable[str]) -> str:
    result = ""
    for line in lines:
        line = re.sub(r"\s+", " ", line).strip()
        if not line:
            continue
        if result.endswith("-"):
            result = result[:-1] + line
        elif result:
            result += " " + line
        else:
            result = line
    return result


#------------------------------------------------------------------------------
# Text formatting
#------------------------------------------------------------------------------

def _format_measurement(value: str, source_unit: str, language: str) -> str:
    values = value.replace(",", ".").split("/")
    numeric_values = [float(item) for item in values]
    conversion = {
        "feet": (0.3, "meters", "feet"),
        "foot": (0.3, "meters", "feet"),
        "ft": (0.3, "meters", "feet"),
        "inches": (0.0254, "meters", "inches"),
        "inch": (0.0254, "meters", "inches"),
        "miles": (1.60934, "kilometers", "miles"),
        "mile": (1.60934, "kilometers", "miles"),
        "metri": (1 / 0.3, "meters", "feet"),
        "metro": (1 / 0.3, "meters", "feet"),
        "m": (1 / 0.3, "meters", "feet"),
        "chilometri": (1 / 1.60934, "kilometers", "miles"),
        "chilometro": (1 / 1.60934, "kilometers", "miles"),
        "km": (1 / 1.60934, "kilometers", "miles"),
        "centimetri": (1 / 0.0254, "meters", "inches"),
        "centimetro": (1 / 0.0254, "meters", "inches"),
        "cm": (1 / 0.0254, "meters", "inches"),
        "pollici": (1 / 0.0254, "meters", "inches"),
        "pollice": (1 / 0.0254, "meters", "inches"),
    }
    factor, metric_unit, imperial_unit = conversion[source_unit.lower()]
    if source_unit.lower() in {"feet", "foot", "ft", "inches", "inch", "miles", "mile"}:
        metric_values = [item * factor for item in numeric_values]
        imperial_values = numeric_values
    else:
        metric_values = numeric_values
        imperial_values = [item * factor for item in numeric_values]

    def format_number(number: float) -> str:
        value = f"{number:.2f}".rstrip("0").rstrip(".")
        return value.replace(".", ",") if language == "it" else value

    metric_text = "/".join(format_number(number) for number in metric_values)
    imperial_text = "/".join(format_number(number) for number in imperial_values)
    if language == "it":
        metric_label = {
            "meters": "metri",
            "kilometers": "chilometri",
        }.get(metric_unit, metric_unit)
        imperial_label = {
            "feet": "piedi",
            "miles": "miglia",
            "inches": "pollici",
        }.get(imperial_unit, imperial_unit)
    else:
        metric_label = metric_unit
        imperial_label = imperial_unit
    return f"{{{metric_text} {metric_label}|{imperial_text} {imperial_label}}}"


def _normalize_measurements(text: str, language: str) -> str:
    if language == "en":
        pattern = r"(?<![\w{])(\d+(?:\.\d+)?(?:/\d+(?:\.\d+)?)?)\s*(feet|foot|ft\.?|inches|inch|miles|mile)\b"
    else:
        pattern = r"(?<![\w{])(\d+(?:,\d+)?(?:/\d+(?:,\d+)?)?)\s*(metri|metro|m\.?|chilometri|chilometro|km|centimetri|centimetro|cm|pollici|pollice)\b"
    return re.sub(
        pattern,
        lambda match: _format_measurement(
            match.group(1),
            match.group(2).rstrip("."),
            language,
        ),
        text,
        flags=re.IGNORECASE,
    )


def _format_paragraph(text: str, language: str) -> str:
    text = _normalize_measurements(text, language)
    title_match = re.match(r"^(.{1,80}?\.)(?:\s+|$)", text)
    if title_match and not text.startswith(("The ", "A ", "An ", "If ", "While ", "For ", "Il ", "La ", "Se ", "Mentre ")):
        title = title_match.group(1)
        text = f"**{title}**{text[len(title):]}"
    labels = (
        "Melee Attack Roll:",
        "Ranged Attack Roll:",
        "Saving Throw:",
        "Strength Saving Throw:",
        "Dexterity Saving Throw:",
        "Constitution Saving Throw:",
        "Intelligence Saving Throw:",
        "Wisdom Saving Throw:",
        "Charisma Saving Throw:",
        "Hit:",
        "Failure:",
        "Success:",
        "Activation:",
        "Effect:",
        "Tiro per colpire in mischia:",
        "Tiro per colpire a distanza:",
        "Tiro salvezza su Forza:",
        "Tiro salvezza su Destrezza:",
        "Tiro salvezza su Costituzione:",
        "Tiro salvezza su Intelligenza:",
        "Tiro salvezza su Saggezza:",
        "Tiro salvezza su Carisma:",
        "Colpito:",
        "Fallimento:",
        "Successo:",
        "Attivazione:",
        "Esito:",
    )
    for label in labels:
        text = re.sub(rf"(?<![_*])\b{re.escape(label)}", f"_{label}_", text, flags=re.IGNORECASE)
    return text


def _line_after_label(lines: list[str], labels: tuple[str, ...]) -> str:
    for index, line in enumerate(lines):
        for label in labels:
            match = re.match(rf"{re.escape(label)}\s*(.*)$", line, re.IGNORECASE)
            if match:
                return match.group(1)
    return ""


def _field_text(lines: list[str], labels: tuple[str, ...], stop_labels: tuple[str, ...]) -> str:
    for index, line in enumerate(lines):
        for label in labels:
            match = re.match(rf"{re.escape(label)}\s*(.*)$", line, re.IGNORECASE)
            if match:
                values = [match.group(1)]
                for next_line in lines[index + 1 :]:
                    if any(re.match(rf"{re.escape(stop)}\b", next_line, re.IGNORECASE) for stop in stop_labels):
                        break
                    if next_line in SECTION_NAMES:
                        break
                    values.append(next_line)
                return _reflow(values)
    return ""


def _parse_descriptor(descriptor: str, language: str) -> tuple[str, str, str]:
    sizes = ENGLISH_SIZES if language == "en" else ITALIAN_SIZES
    type_values = ENGLISH_TYPE_VALUES if language == "en" else ITALIAN_TYPE_VALUES
    size = "medium"
    descriptor_prefix = descriptor.split(",", 1)[0]
    size_matches = [
        (match.start(), candidate)
        for candidate in sizes
        for match in re.finditer(rf"\b{re.escape(candidate)}\b", descriptor_prefix, re.IGNORECASE)
    ]
    if size_matches:
        for _, candidate in sorted(size_matches):
            size = {
                "Tiny": "tiny",
                "Small": "small",
                "Medium": "medium",
                "Large": "large",
                "Huge": "huge",
                "Gargantuan": "gargantuan",
                "Minuscola": "tiny",
                "Minuscolo": "tiny",
                "Piccola": "small",
                "Piccolo": "small",
                "Media": "medium",
                "Medio": "medium",
                "Grande": "large",
                "Enorme": "huge",
                "Mastodontica": "gargantuan",
                "Mastodontico": "gargantuan",
            }[candidate]
            break

    creature_type = "beast"
    for candidate, value in type_values.items():
        if re.search(rf"\b{re.escape(candidate)}\b", descriptor, re.IGNORECASE):
            creature_type = value
            break

    alignment = "true_neutral"
    alignment_values = {
        "lawful good": "lawful_good",
        "neutral good": "neutral_good",
        "chaotic good": "chaotic_good",
        "lawful neutral": "lawful_neutral",
        "neutral": "true_neutral",
        "true neutral": "true_neutral",
        "chaotic neutral": "chaotic_neutral",
        "lawful evil": "lawful_evil",
        "neutral evil": "neutral_evil",
        "chaotic evil": "chaotic_evil",
        "unaligned": "unaligned",
        "any alignment": "any",
        "legale buono": "lawful_good",
        "neutrale buono": "neutral_good",
        "caotico buono": "chaotic_good",
        "legale neutrale": "lawful_neutral",
        "neutrale": "true_neutral",
        "caotico neutrale": "chaotic_neutral",
        "legale malvagio": "lawful_evil",
        "neutrale malvagio": "neutral_evil",
        "caotico malvagio": "chaotic_evil",
        "senza allineamento": "unaligned",
        "qualsiasi allineamento": "any",
    }
    lowered = descriptor.lower()
    for label, value in alignment_values.items():
        if label in lowered:
            alignment = value
            break
    return size, creature_type, alignment


def _parse_abilities(lines: list[str]) -> tuple[dict[str, int], dict[str, int]]:
    text = " ".join(lines)
    abilities: dict[str, int] = {}
    saves: dict[str, int] = {}
    pattern = r"(Str|Dex|Con|Int|WIS|Wis|Cha|For|Des|Cos|sag|Sag|Car)\s*(\d+)\s*([-+−]\d+)\s*([-+−]\d+)"
    for match in re.finditer(pattern, text):
        ability = ABILITY_NAMES[match.group(1).lower()]
        abilities[ability] = int(match.group(2))
        saves[ability] = _parse_int(match.group(4))
    return abilities, saves


def _parse_skills(text: str) -> dict[str, int]:
    result: dict[str, int] = {}
    for name, value in SKILL_NAMES.items():
        match = re.search(rf"{re.escape(name)}\s*([-+−]\d+)", text, re.IGNORECASE)
        if match:
            result[value] = _parse_int(match.group(1))
    return result


def _parse_damage_values(text: str) -> list[str]:
    result: list[str] = []
    for name, value in DAMAGE_NAMES.items():
        if re.search(rf"\b{re.escape(name)}\b", text, re.IGNORECASE) and value not in result:
            result.append(value)
    return result


def _parse_condition_values(text: str) -> list[str]:
    result: list[str] = []
    for name, value in CONDITION_NAMES.items():
        if re.search(rf"\b{re.escape(name)}\b", text, re.IGNORECASE) and value not in result:
            result.append(value)
    return result


def _parse_speed(text: str, language: str) -> dict[str, int | bool]:
    result: dict[str, int | bool] = {
        "burrow": 0,
        "climb": 0,
        "fly": 0,
        "hover": False,
        "swim": 0,
        "walk": 0,
    }
    unit = r"(?:ft\.?|feet|m(?:etri|eteri)?\.?)" if language == "en" else r"m(?:etri|eteri)?\.?"
    speed_names = {
        "burrow": ("Burrow", "scavo"),
        "climb": ("Climb", "scalata", "arrampicata"),
        "fly": ("Fly", "volo"),
        "swim": ("Swim", "nuoto"),
        "walk": ("Speed", "Velocità"),
    }
    for key, labels in speed_names.items():
        for label in labels:
            match = re.search(rf"{re.escape(label)}[^,;]*(\d+(?:[,.]\d+)?)\s*{unit}", text, re.IGNORECASE)
            if match:
                result[key] = _feet_or_meters_to_cm(match.group(1), language)
                break
    if result["walk"] == 0:
        match = re.search(r"(\d+(?:[,.]\d+)?)\s*" + unit, text, re.IGNORECASE)
        if match:
            result["walk"] = _feet_or_meters_to_cm(match.group(1), language)
    result["hover"] = "hover" in text.lower() or "stazionario" in text.lower()
    return result


def _parse_senses(text: str, language: str) -> dict[str, int]:
    result = {"blindsight": 0, "darkvision": 0, "telepathy": 0, "tremorsense": 0, "truesight": 0}
    patterns = {
        "blindsight": ("Blindsight", "vista cieca"),
        "darkvision": ("Darkvision", "scurovisione"),
        "telepathy": ("telepathy", "telepatia"),
        "tremorsense": ("Tremorsense", "percezione tellurica"),
        "truesight": ("Truesight", "vista vera"),
    }
    unit = r"(?:ft\.?|feet)" if language == "en" else r"m(?:etri|eteri)?\.?"
    for key, labels in patterns.items():
        for label in labels:
            match = re.search(rf"{re.escape(label)}\s*(\d+(?:[,.]\d+)?)\s*{unit}", text, re.IGNORECASE)
            if match:
                result[key] = _feet_or_meters_to_cm(match.group(1), language)
                break
    return result


def _parse_languages(text: str, language: str) -> tuple[list[str], str, str]:
    value = text.strip()
    lowered = value.lower()
    if not value or lowered in {"none", "nessuna"}:
        return [], "none", "speaks"
    if "all languages" in lowered or "tutte le lingue" in lowered:
        return [], "all", "speaks"
    mode = "understands" if lowered.startswith(("understands", "capisce", "comprende")) else "speaks"
    value = re.sub(r"^(understands|capisce|comprende)\s+", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\s+but (?:can’t|can't) speak.*$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\s+ma non parla.*$", "", value, flags=re.IGNORECASE)
    names = [part.strip() for part in re.split(r"[,;]", value) if part.strip()]
    return names, "specific", mode


def _parse_additional_language_count(text: str) -> int:
    match = re.search(
        r"(?:plus|più)\s+(one|two|three|four|five|uno|un'altra|un altra|due|tre|quattro|cinque)\s+(?:other\s+)?(?:languages?|lingue?)",
        text,
        re.IGNORECASE,
    )
    if not match:
        return 0
    return {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "uno": 1,
        "un'altra": 1,
        "un altra": 1,
        "due": 2,
        "tre": 3,
        "quattro": 4,
        "cinque": 5,
    }[match.group(1).lower()]


def _parse_equipment_names(text: str, language: str) -> list[str]:
    value = text.strip()
    if not value:
        return []
    value = re.sub(r"^(Equipment|Attrezzatura)\s*", "", value, flags=re.IGNORECASE)
    return [part.strip() for part in value.split(",") if part.strip()]


def _parse_sections(lines: list[TextLine], language: str) -> dict[str, str]:
    sections: dict[str, list[TextLine]] = {}
    current: str | None = None
    for line in lines:
        if line.text in SECTION_NAMES:
            current = {
                "Traits": "traits",
                "Tratti": "traits",
                "Actions": "actions",
                "Azioni": "actions",
                "Bonus Actions": "bonus_actions",
                "Azioni bonus": "bonus_actions",
                "Reactions": "reactions",
                "Reazioni": "reactions",
                "Legendary Actions": "legendary_actions",
                "Azioni leggendarie": "legendary_actions",
                "Lair Actions": "lair_effects",
                "Azioni della tana": "lair_effects",
            }[line.text]
            sections.setdefault(current, [])
            continue
        if current is not None:
            sections[current].append(line)

    result: dict[str, str] = {}
    for key, section_lines in sections.items():
        paragraphs: list[list[str]] = []
        current_paragraph: list[str] = []
        previous: TextLine | None = None
        for line in section_lines:
            starts_new_paragraph = bool(
                current_paragraph
                and previous is not None
                and previous.page == line.page
                and previous.column == line.column
                and line.y - previous.y > 14.5
            )
            if starts_new_paragraph:
                paragraphs.append(current_paragraph)
                current_paragraph = []
            current_paragraph.append(line.text)
            previous = line
        if current_paragraph:
            paragraphs.append(current_paragraph)
        result[key] = "\n\n".join(
            _format_paragraph(_reflow(paragraph), language) for paragraph in paragraphs
        )
    return result


def _parse_block(block: CreatureBlock, page_offset: int) -> ParsedCreature:
    lines = [line.text for line in block.lines]
    text = " ".join(lines)
    size, creature_type, alignment = _parse_descriptor(block.descriptor, block.language)
    abilities, ability_saves = _parse_abilities(lines[:12])
    abilities = {key: abilities.get(key, 10) for key in ("str", "dex", "con", "int", "wis", "cha")}
    ability_saves = {key: ability_saves.get(key, 0) for key in abilities}

    ac_match = re.search(r"(?:AC|CA)\s+(\d+)", text)
    initiative_match = re.search(r"(?:Initiative|Iniziativa)\s*([-+−]\d+)", text)
    hp_match = re.search(r"(?:HP|PF)\s+(\d+)\s*\(([^)]*)\)", text)
    cr_match = re.search(r"(?:CR|GS)\s+([0-9]+(?:/[0-9]+)?|[½¼⅛])", text)
    exp_match = re.search(r"(?:XP|PE)\s+([\d.,]+)", text)
    pb_match = re.search(r"(?:PB|BC)\s+([-+−]\d+)", text)
    speed_text = _line_after_label(lines, ("Speed", "Velocità"))
    sense_text = _field_text(lines, ("Senses", "Sensi"), ("Languages", "Lingue", "CR", "GS"))
    language_text = _field_text(lines, ("Languages", "Lingue"), ("CR", "GS", "Traits", "Tratti", "Actions", "Azioni"))
    resistance_text = _field_text(lines, ("Resistances", "Resistenze"), ("Immunities", "Immunità", "Vulnerabilities", "Vulnerabilità", "Senses", "Sensi"))
    immunity_text = _field_text(lines, ("Immunities", "Immunità"), ("Vulnerabilities", "Vulnerabilità", "Senses", "Sensi", "Languages", "Lingue"))
    vulnerability_text = _field_text(lines, ("Vulnerabilities", "Vulnerabilità"), ("Resistances", "Resistenze", "Immunities", "Immunità", "Senses", "Sensi", "Languages", "Lingue"))
    equipment_text = _field_text(lines, ("Equipment", "Attrezzatura"), ("Senses", "Sensi", "Languages", "Lingue", "CR", "GS"))
    skills_text = _field_text(lines, ("Skills", "Abilità"), ("Resistances", "Resistenze", "Immunities", "Immunità", "Senses", "Sensi", "Languages", "Lingue", "CR", "GS"))
    languages, language_scope, language_mode = _parse_languages(language_text, block.language)
    sections = _parse_sections(block.lines, block.language)
    return ParsedCreature(
        language=block.language,
        name=block.name,
        descriptor=block.descriptor,
        page=block.page + page_offset,
        size=size,
        type=creature_type,
        alignment=alignment,
        ac=_parse_int(ac_match.group(1)) if ac_match else 10,
        initiative=_parse_int(initiative_match.group(1)) if initiative_match else 0,
        hp=_parse_int(hp_match.group(1)) if hp_match else 1,
        hp_formula=hp_match.group(2).replace("−", "-").replace("–", "-").strip() if hp_match else "",
        cr=_parse_cr(cr_match.group(1)) if cr_match else 0,
        exp=_parse_int(exp_match.group(1).replace(",", "").replace(".", "")) if exp_match else 0,
        pb=_parse_int(pb_match.group(1)) if pb_match else 2,
        abilities=abilities,
        ability_saves=ability_saves,
        skills=_parse_skills(skills_text),
        lines=lines,
        sections=sections,
        language_names=languages,
        language_scope=language_scope,
        language_mode=language_mode,
        language_additional_count=_parse_additional_language_count(language_text),
        resistance_text=resistance_text,
        immunity_text=immunity_text,
        vulnerability_text=vulnerability_text,
        sense_text=sense_text,
        speed_text=speed_text,
        equipment_names=_parse_equipment_names(equipment_text, block.language),
    )


#------------------------------------------------------------------------------
# Bundle conversion
#------------------------------------------------------------------------------

def _empty_i18n() -> dict[str, str]:
    return {"en": "", "it": ""}


def _split_damage_and_conditions(value: str) -> tuple[list[str], list[str]]:
    damage_text, _, condition_text = value.partition(";")
    return _parse_damage_values(damage_text), _parse_condition_values(condition_text)


def _ability_modifier(value: int) -> int:
    return (value - 10) // 2


def _parse_ability_proficiencies(creature: ParsedCreature) -> list[str]:
    return [
        ABILITY_FULL_NAMES[ability]
        for ability, save in creature.ability_saves.items()
        if save != _ability_modifier(creature.abilities[ability])
    ]


def _parse_skill_proficiencies(creature: ParsedCreature) -> tuple[list[str], list[str]]:
    skill_abilities = {
        "acrobatics": "dex",
        "animal_handling": "wis",
        "arcana": "int",
        "athletics": "str",
        "deception": "cha",
        "history": "int",
        "insight": "wis",
        "intimidation": "cha",
        "investigation": "int",
        "medicine": "wis",
        "nature": "int",
        "perception": "wis",
        "performance": "cha",
        "persuasion": "cha",
        "religion": "int",
        "sleight_of_hand": "dex",
        "stealth": "dex",
        "survival": "wis",
    }
    proficiencies: list[str] = []
    expertise: list[str] = []
    for skill, bonus in creature.skills.items():
        ability = skill_abilities[skill]
        minimum = _ability_modifier(creature.abilities[ability]) + creature.pb
        if bonus >= minimum:
            proficiencies.append(skill)
        if bonus >= minimum + creature.pb:
            expertise.append(skill)
    return proficiencies, expertise


def _normalize_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _create_name_lookup(bundle: dict[str, Any], kinds: Iterable[str]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for kind in kinds:
        for resource in bundle.get("resources", {}).get(kind, []):
            resource_id = resource.get("id")
            for name in (resource.get("name") or {}).values():
                if resource_id and isinstance(name, str):
                    lookup[_normalize_name(name)] = resource_id
    return lookup


def _language_entries(creature: ParsedCreature, bundle: dict[str, Any]) -> list[dict[str, str]]:
    lookup = _create_name_lookup(bundle, ("languages",))
    entries: list[dict[str, str]] = []
    for name in creature.language_names:
        resource_id = lookup.get(_normalize_name(name))
        if resource_id and not any(entry["language_id"] == resource_id for entry in entries):
            entries.append({"language_id": resource_id, "mode": creature.language_mode})
    return entries


def _equipment_bundle(
    creature: ParsedCreature,
    localized_creature: ParsedCreature,
    bundle: dict[str, Any],
) -> dict[str, Any]:
    lookup = _create_name_lookup(bundle, ("armors", "items", "tools", "weapons"))
    equipments: list[dict[str, Any]] = []
    for name in [*creature.equipment_names, *localized_creature.equipment_names]:
        resource_id = lookup.get(_normalize_name(name))
        if resource_id and not any(entry["id"] == resource_id for entry in equipments):
            equipments.append({"id": resource_id, "notes": {"en": "", "it": ""}, "quantity": 1})
    return {"currency": 0, "equipments": equipments}


def _parse_creature_row(
    english: ParsedCreature,
    italian: ParsedCreature,
    bundle: dict[str, Any],
    existing_ids: dict[str, str],
) -> dict[str, Any]:
    resistance_damage, resistance_conditions = _split_damage_and_conditions(english.resistance_text)
    immunity_damage, immunity_conditions = _split_damage_and_conditions(english.immunity_text)
    vulnerability_damage, vulnerability_conditions = _split_damage_and_conditions(english.vulnerability_text)
    proficiencies, expertise = _parse_skill_proficiencies(english)
    section_names = ("actions", "bonus_actions", "legendary_actions", "reactions", "traits", "lair_effects")
    sections = {
        section: {
            "en": english.sections.get(section, ""),
            "it": italian.sections.get(section, ""),
        }
        for section in section_names
    }
    row_id = existing_ids.get(_normalize_name(english.name)) or str(
        uuid.uuid5(CREATURE_NAMESPACE, f"{bundle['source']['id']}:creature:{_normalize_name(english.name)}")
    )
    speed = _parse_speed(english.speed_text, "en")
    senses = _parse_senses(english.sense_text, "en")
    cr_text = next(
        (line for line in english.lines if re.search(r"(?:CR|GS)\s+", line)),
        "",
    )
    lair_exp_match = re.search(
        r"(?:or|o)\s+([\d,]+)\s+(?:in lair|nella tana)",
        cr_text,
        re.IGNORECASE,
    )
    legendary_text = english.sections.get("legendary_actions", "")
    legendary_count_match = re.search(
        r"(?:Legendary Action Uses|Utilizzi di azioni leggendarie):\s*(\d+)",
        legendary_text,
        re.IGNORECASE,
    )
    lair_legendary_count_match = re.search(
        r"\((\d+)\s+(?:in Lair|nella tana)",
        legendary_text,
        re.IGNORECASE,
    )
    row = {
        "id": row_id,
        "kind": "creature",
        "source_code": bundle["source"]["code"],
        "source_id": bundle["source"]["id"],
        "source_version": bundle["source"]["version"],
        "image_url": None,
        "visibility": "public",
        "name": {"en": english.name, "it": italian.name},
        "name_short": {"en": "", "it": ""},
        "page": {"en": english.page, "it": italian.page},
        "ability_cha": english.abilities["cha"],
        "ability_con": english.abilities["con"],
        "ability_dex": english.abilities["dex"],
        "ability_int": english.abilities["int"],
        "ability_proficiencies": _parse_ability_proficiencies(english),
        "ability_str": english.abilities["str"],
        "ability_wis": english.abilities["wis"],
        "ac": english.ac,
        "actions": sections["actions"],
        "alignment": english.alignment,
        "blindsight": senses["blindsight"],
        "bonus_actions": sections["bonus_actions"],
        "condition_immunities": immunity_conditions,
        "condition_resistances": resistance_conditions,
        "condition_vulnerabilities": vulnerability_conditions,
        "cr": english.cr,
        "damage_immunities": immunity_damage,
        "damage_resistances": resistance_damage,
        "damage_vulnerabilities": vulnerability_damage,
        "darkvision": senses["darkvision"],
        "exp": english.exp,
        "habitats": [],
        "has_lair": bool(english.sections.get("lair_effects")),
        "hover": bool(speed["hover"]),
        "hp": english.hp,
        "hp_formula": english.hp_formula,
        "initiative": english.initiative,
        "lair_effects": sections["lair_effects"],
        "lair_exp": _parse_int(lair_exp_match.group(1).replace(",", "")) if lair_exp_match else english.exp,
        "lair_legendary_actions_count": _parse_int(lair_legendary_count_match.group(1)) if lair_legendary_count_match else 0,
        "language_additional_count": english.language_additional_count,
        "language_entries": _language_entries(english, bundle),
        "language_scope": english.language_scope,
        "legendary_actions": sections["legendary_actions"],
        "legendary_actions_count": _parse_int(legendary_count_match.group(1)) if legendary_count_match else 0,
        "passive_perception": _parse_int(re.search(r"(?:Passive Perception|Percezione passiva)\s+(\d+)", english.sense_text, re.IGNORECASE).group(1)) if re.search(r"(?:Passive Perception|Percezione passiva)\s+(\d+)", english.sense_text, re.IGNORECASE) else 10,
        "pb": english.pb,
        "plane_ids": [],
        "reactions": sections["reactions"],
        "size": english.size,
        "skill_expertise": expertise,
        "skill_proficiencies": proficiencies,
        "speed_burrow": int(speed["burrow"]),
        "speed_climb": int(speed["climb"]),
        "speed_fly": int(speed["fly"]),
        "speed_swim": int(speed["swim"]),
        "speed_walk": int(speed["walk"]),
        "tag_ids": [],
        "telepathy_range": senses["telepathy"],
        "traits": sections["traits"],
        "treasures": [],
        "tremorsense": senses["tremorsense"],
        "truesight": senses["truesight"],
        "type": english.type,
        "gear": _equipment_bundle(english, italian, bundle),
    }
    return row


def _signature(creature: ParsedCreature) -> tuple[Any, ...]:
    return (creature.ac, creature.hp, creature.hp_formula, creature.cr, creature.type, creature.size)


def _collect_known_translations(data_root: Path) -> dict[str, str]:
    translations: dict[str, str] = dict(KNOWN_CREATURE_TRANSLATIONS)
    for path in data_root.glob("*/*/bundle.json"):
        try:
            bundle = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError):
            continue
        for creature in bundle.get("resources", {}).get("creatures", []):
            names = creature.get("name") or {}
            english = names.get("en")
            italian = names.get("it")
            if english and italian:
                translations[_normalize_name(english)] = _normalize_name(italian)
    return translations


def _convert_bundle(
    english: list[ParsedCreature],
    italian: list[ParsedCreature],
    bundle: dict[str, Any],
    known_translations: dict[str, str],
) -> dict[str, Any]:
    italian_by_signature: dict[tuple[Any, ...], deque[ParsedCreature]] = defaultdict(deque)
    for creature in italian:
        italian_by_signature[_signature(creature)].append(creature)
    existing_ids = {
        _normalize_name(resource.get("name", {}).get("en", "")): resource["id"]
        for resource in bundle.get("resources", {}).get("creatures", [])
        if resource.get("id")
    }
    rows: list[dict[str, Any]] = []
    for creature in english:
        matches = italian_by_signature[_signature(creature)]
        if not matches:
            raise ValueError(f"No Italian match for {creature.name!r} ({_signature(creature)})")
        expected_name = known_translations.get(_normalize_name(creature.name))
        italian_match = next(
            (match for match in matches if _normalize_name(match.name) == expected_name),
            None,
        )
        if italian_match is not None:
            matches.remove(italian_match)
        else:
            italian_match = matches.popleft()
        rows.append(_parse_creature_row(creature, italian_match, bundle, existing_ids))
    bundle["resources"]["creatures"] = rows
    return bundle


#------------------------------------------------------------------------------
# Intermediate output
#------------------------------------------------------------------------------

def _block_to_json(block: CreatureBlock) -> dict[str, Any]:
    return {
        "language": block.language,
        "page": block.page,
        "column": block.column,
        "name": block.name,
        "descriptor": block.descriptor,
        "lines": [
            {"page": line.page, "column": line.column, "y": line.y, "text": line.text, "bold": line.bold}
            for line in block.lines
        ],
    }


def _write_blocks(path: Path, blocks: list[CreatureBlock]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps([_block_to_json(block) for block in blocks], ensure_ascii=False, indent=2) + "\n")


#------------------------------------------------------------------------------
# Main
#------------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--english", type=Path, required=True)
    parser.add_argument("--italian", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--bundle", type=Path)
    parser.add_argument("--bundle-output", type=Path)
    parser.add_argument("--data-root", type=Path, default=Path("data"))
    parser.add_argument("--english-page-offset", type=int, default=257)
    parser.add_argument("--italian-page-offset", type=int, default=293)
    args = parser.parse_args()

    english_blocks = _extract_blocks(_extract_lines(args.english, "en"), "en")
    italian_blocks = _extract_blocks(_extract_lines(args.italian, "it"), "it")
    _write_blocks(args.output.with_name(args.output.stem + "-en.json"), english_blocks)
    _write_blocks(args.output.with_name(args.output.stem + "-it.json"), italian_blocks)
    print(f"English blocks: {len(english_blocks)}")
    print(f"Italian blocks: {len(italian_blocks)}")

    if args.bundle:
        if not args.bundle_output:
            parser.error("--bundle-output is required with --bundle")
        english = [_parse_block(block, args.english_page_offset) for block in english_blocks]
        italian = [_parse_block(block, args.italian_page_offset) for block in italian_blocks]
        bundle = json.loads(args.bundle.read_text())
        converted = _convert_bundle(
            english,
            italian,
            bundle,
            _collect_known_translations(args.data_root),
        )
        args.bundle_output.parent.mkdir(parents=True, exist_ok=True)
        args.bundle_output.write_text(json.dumps(converted, ensure_ascii=False, indent=2) + "\n")
        print(f"Wrote creature bundle: {args.bundle_output}")


if __name__ == "__main__":
    main()
