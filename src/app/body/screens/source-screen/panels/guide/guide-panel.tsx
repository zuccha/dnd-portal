import { Alert, Box, Code, Heading, Link, List, Separator, Text, VStack } from "@chakra-ui/react";
import { Fragment } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { bold, heading, italic } from "~/ui/rich-text-page";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Documentation Content
//------------------------------------------------------------------------------

type DocumentationSection = {
  blocks?: DocumentationBlock[];
  bullets?: string[];
  example?: string;
  examplePrefix?: string;
  id: string;
  paragraphs: string[];
  steps?: string[];
  title: string;
  warning?: string;
};

type DocumentationBlock =
  | { text: string; type: "paragraph" }
  | { text: string; type: "example" }
  | { items: DocumentationListItem[]; type: "list" }
  | { text: string; type: "warning" };

type DocumentationListItem = {
  items?: DocumentationListItem[];
  text: string;
};

type DocumentationContent = {
  groups: Record<DocumentationGroup, string>;
  intro: string;
  sections: DocumentationSection[];
  title: string;
};

type DocumentationGroup = "overview" | "resources" | "sources" | "deck" | "printing";

const documentationGroupBySectionId: Record<string, DocumentationGroup> = {
  "annotations": "resources",
  "browser-printing": "printing",
  "concepts": "overview",
  "import-export": "sources",
  "implementation": "overview",
  "language": "resources",
  "local-remote": "sources",
  "print-deck": "deck",
  "print-editing": "deck",
  "print-options": "printing",
  "resources": "resources",
  "resource-actions": "resources",
  "resource-editing": "resources",
  "source-management": "sources",
  "source-settings": "sources",
  "start": "overview",
  "units": "resources",
  "variants": "resources",
};

//------------------------------------------------------------------------------
// Guide Panel
//------------------------------------------------------------------------------

export default function GuidePanel() {
  const [lang] = useI18nLang();
  const content = documentation[lang] ?? documentation["en"]!;

  return (
    <VStack
      align="stretch"
      flex={1}
      gap={8}
      h="full"
      overflow="auto"
      px={{ base: 5, md: 10 }}
      py={{ base: 6, md: 10 }}
    >
      <VStack align="stretch" gap={3} maxW="4xl" mx="auto" w="full">
        <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="semibold" lineHeight={1.1}>
          {content.title}
        </Heading>
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
          {content.intro}
        </Text>
      </VStack>

      <DocumentationContents
        groups={content.groups}
        label={lang === "it" ? "Indice" : "Contents"}
        sections={content.sections}
      />

      {content.sections.map((section, index) => {
        const group = documentationGroupBySectionId[section.id]!;
        const previousSection = content.sections[index - 1];
        const previousGroup = previousSection
          ? documentationGroupBySectionId[previousSection.id]
          : undefined;

        return (
          <Fragment key={section.id}>
            {group !== previousGroup && (
              <DocumentationGroupHeading>{content.groups[group]}</DocumentationGroupHeading>
            )}
            <DocumentationSectionView section={section} sectionNumber={index + 1} />
          </Fragment>
        );
      })}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Documentation Contents
//------------------------------------------------------------------------------

function DocumentationContents({
  groups,
  label,
  sections,
}: {
  groups: Record<DocumentationGroup, string>;
  label: string;
  sections: DocumentationSection[];
}) {
  return (
    <Box maxW="4xl" mx="auto" w="full">
      <Text color="fg.muted" fontSize="sm" fontWeight="semibold" mb={2}>
        {label}
      </Text>
      <Box color="fg.muted" fontSize="sm">
        {sections.map((section, index) => {
          const group = documentationGroupBySectionId[section.id]!;
          const previousSection = sections[index - 1];
          const previousGroup = previousSection
            ? documentationGroupBySectionId[previousSection.id]
            : undefined;
          const sectionLink = (
            <Link href={`#${section.id}`} _hover={{ color: "fg" }}>
              {index + 1}. {section.title}
            </Link>
          );

          return (
            <Fragment key={section.id}>
              {group !== previousGroup && (
                <Text fontWeight="semibold" mt={index ? 3 : 0}>
                  {groups[group]}
                </Text>
              )}
              <Box pl={4} py={0.5}>
                {sectionLink}
              </Box>
            </Fragment>
          );
        })}
      </Box>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Documentation Group Heading
//------------------------------------------------------------------------------

function DocumentationGroupHeading({ children }: { children: ReactNode }) {
  return (
    <Heading fontSize="2xl" fontWeight="semibold" maxW="4xl" mx="auto" pt={4} w="full">
      {children}
    </Heading>
  );
}

//------------------------------------------------------------------------------
// Documentation Section View
//------------------------------------------------------------------------------

function DocumentationSectionView({
  section,
  sectionNumber,
}: {
  section: DocumentationSection;
  sectionNumber: number;
}) {
  return (
    <VStack
      align="stretch"
      gap={4}
      maxW="4xl"
      mx="auto"
      w="full"
      id={section.id}
      scrollMarginTop={6}
    >
      <Separator />
      <Heading fontSize="xl" fontWeight="semibold">
        {sectionNumber}. {section.title}
      </Heading>

      {section.blocks
        ? section.blocks.map((block, index) => (
            <DocumentationBlockView block={block} key={`${block.type}-${index}`} />
          ))
        : section.paragraphs.map((paragraph) => (
            <Text key={paragraph} color="fg" lineHeight="tall">
              {renderDocumentationText(paragraph)}
            </Text>
          ))}

      {section.steps && (
        <List.Root as="ol" color="fg" lineHeight="tall" listStyleType="decimal" pl={5}>
          {section.steps.map((step) => (
            <List.Item key={step} mb={2}>
              {renderDocumentationText(step)}
            </List.Item>
          ))}
        </List.Root>
      )}

      {section.bullets && (
        <List.Root as="ul" color="fg" lineHeight="tall" listStyleType="disc" pl={5}>
          {section.bullets.map((bullet) => (
            <List.Item key={bullet} mb={2}>
              {renderDocumentationText(bullet)}
            </List.Item>
          ))}
        </List.Root>
      )}

      {section.example && (
        <DocumentationExample>
          {section.examplePrefix && (
            <>
              <Text as="span" fontWeight="bold">
                {section.examplePrefix}
              </Text>
              {"\n"}
            </>
          )}
          {section.example}
        </DocumentationExample>
      )}
      {section.warning && (
        <DocumentationWarning>{renderDocumentationText(section.warning)}</DocumentationWarning>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Documentation Block View
//------------------------------------------------------------------------------

function DocumentationBlockView({ block }: { block: DocumentationBlock }) {
  if (block.type === "example") {
    return <DocumentationExample>{renderDocumentationText(block.text)}</DocumentationExample>;
  }

  if (block.type === "warning") {
    return <DocumentationWarning>{renderDocumentationText(block.text)}</DocumentationWarning>;
  }

  if (block.type === "list") {
    return (
      <List.Root as="ul" color="fg" lineHeight="tall" listStyleType="disc" pl={5}>
        {block.items.map((item) => (
          <List.Item key={item.text} mb={2}>
            {renderDocumentationText(item.text)}
            {item.items && (
              <List.Root as="ul" listStyleType="circle" mt={1} pl={5}>
                {item.items.map((subitem) => (
                  <List.Item key={subitem.text} mb={1}>
                    {renderDocumentationText(subitem.text)}
                  </List.Item>
                ))}
              </List.Root>
            )}
          </List.Item>
        ))}
      </List.Root>
    );
  }

  return (
    <Text color="fg" lineHeight="tall">
      {renderDocumentationText(block.text)}
    </Text>
  );
}

//------------------------------------------------------------------------------
// Render Documentation Text
//------------------------------------------------------------------------------

function renderDocumentationText(text: string): ReactNode {
  return text.split(/(``[^`]+``|`[^`]+`)/g).map((part, index) =>
    part.startsWith("``") && part.endsWith("``") ? (
      <Code key={`${part}-${index}`} size="sm">
        {part.slice(2, -2)}
      </Code>
    ) : part.startsWith("`") && part.endsWith("`") ? (
      <Text as="span" fontStyle="italic" key={`${part}-${index}`}>
        {part.slice(1, -1)}
      </Text>
    ) : (
      part
    ),
  );
}

//------------------------------------------------------------------------------
// Documentation Example
//------------------------------------------------------------------------------

function DocumentationExample({ children }: { children: ReactNode }) {
  return (
    <Alert.Root
      borderLeftColor="colorPalette.border"
      borderLeftWidth="4px"
      color="fg.documentation"
      status="info"
      variant="outline"
    >
      <Alert.Indicator />
      <Alert.Content>
        <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">
          {children}
        </Text>
      </Alert.Content>
    </Alert.Root>
  );
}

//------------------------------------------------------------------------------
// Documentation Warning
//------------------------------------------------------------------------------

function DocumentationWarning({ children }: { children: ReactNode }) {
  return (
    <Alert.Root
      borderLeftColor="colorPalette.border"
      borderLeftWidth="4px"
      color="fg.documentation"
      status="warning"
      variant="outline"
    >
      <Alert.Indicator />
      <Alert.Content>
        <Text lineHeight="tall">{children}</Text>
      </Alert.Content>
    </Alert.Root>
  );
}

//------------------------------------------------------------------------------
// Documentation
//------------------------------------------------------------------------------

const documentation: Record<string, DocumentationContent> = {
  en: {
    groups: {
      deck: "Print Deck",
      overview: "Overview",
      printing: "Printing",
      resources: "Working with resources",
      sources: "Working with sources",
    },
    title: "ZorboDnD Documentation",
    intro:
      "ZorboDnD is a local-first application for organizing, consulting, editing, and printing D&D resources. This guide documents the concepts and workflows used throughout the app.",
    sections: [
      {
        id: "start",
        title: "Getting started",
        paragraphs: [
          "The application works primarily offline. Sources downloaded or imported on this device are loaded into the local catalogue and remain available without a network connection.",
          "To start using the application, follow these steps:",
        ],
        steps: [
          "Open `Sources` and install a catalog source, or import a JSON source file.",
          "Select the source from the sidebar source selector.",
          "Choose a resource group, such as `Spells`, `Creatures`, or `Equipment`.",
          "Use `Table view` to compare many resources or `Card view` to read them.",
          "Select useful resources and open the `Print Deck` when you need table-ready cards.",
        ],
      },
      {
        id: "concepts",
        title: "Sources, resources, and printing",
        paragraphs: [
          "A source is a coherent collection of game content. The SRD, a rulebook extract, or a campaign source can each be represented as a source. A source also contains metadata such as its name, code, version, dependencies, and publication status.",
          "A resource is one entry inside a source: a spell, creature, item, weapon, class, feat, or another supported kind of D&D content. Resources keep their stable identifiers when they are imported, edited, or added to a print deck.",
          "The `Print Deck` is a personal collection of resource cards. It is separate from the source: changing a card in the `Print Deck` changes only that deck entry, not the original resource.",
        ],
      },
      {
        id: "implementation",
        title: "Implementation and privacy",
        paragraphs: [
          "The application is built with React and TypeScript, bundled with Vite, and styled with Chakra UI.",
          "Sources and resource bundles are stored in the browser's IndexedDB database. This is what allows downloaded and imported content to remain available offline. The application uses localStorage for lightweight preferences and local settings, such as language, units, and other interface choices.",
          "Supabase is used for optional online features such as authentication, catalog sources, downloads, automatic updates, and publishing. Local sources and resources are not uploaded automatically; network requests happen when an online feature is used or when automatic catalog updates are enabled.",
          "The application does not use analytics, advertising, or behavioral tracking. It does not profile which pages you visit or which resources you consult.",
        ],
      },
      {
        id: "local-remote",
        title: "Local and catalog sources",
        paragraphs: [
          "A catalog source is associated with a published source online. It can receive updates and may be `Read-only` or editable depending on your access. Automatic updates are enabled by default and can be disabled in the application settings.",
          "A local source exists only on this device and is marked `Local`. A catalog source can be made local, also called detached, when you want to stop receiving catalog updates and edit the copy freely. Detaching does not create a second source; it changes how the installed copy is managed.",
          "As long as a source is available in the catalog but has not been downloaded, it is marked `Not installed`. After it has been downloaded, a catalog source is marked `Installed`.",
        ],
        bullets: [
          "Use `Download` to obtain an available catalog source.",
          "Use `Make Local` when you want an installed catalog source to become an independent local copy.",
          "Use `Make Official` to reconnect a detached local copy to the catalog. The official version is downloaded and replaces the local source, so local changes are lost.",
          "Use `Remove` on a catalog source to uninstall its local copy while leaving the source available in the catalog. Use it on a local source to delete the source and its resources from this device.",
        ],
      },
      {
        id: "source-management",
        title: "Create, edit, and remove a source",
        paragraphs: [
          "Local sources are fully editable on this device. To create one, open `Sources` and choose `Create Source`, then enter its name, code, type, and version.",
          "Open a source's settings to change its metadata and dependencies.",
          "Removing a source deletes its local bundle and its resources from this device. If other installed sources depend on it, the application warns you before the removal. Export the source first if you may need to restore it.",
          "To create or manage a local source:",
        ],
        steps: [
          "Open `Sources` and choose `Create Source`.",
          "Enter the source metadata and confirm creation.",
          "Open the source settings to change metadata, includes, and requires.",
          "Use `Remove` to delete the local source and its resources.",
        ],
      },
      {
        id: "import-export",
        title: "Import and export",
        paragraphs: [
          "A source can be represented as a JSON bundle. The bundle contains the source metadata and its resources, including localized values and relationships with other sources.",
          "Sources can be exported from the `Sources` page with the `Export` command. The selected source is downloaded as a complete JSON bundle, which you can keep as a backup or share with another user.",
          "Sources can be imported from the `Sources` page with the `Import` command. The JSON bundle is validated, migrated from older formats when necessary, saved locally, and loaded into the in-memory catalogue.",
          "If the imported source already exists on this device, importing replaces its local content. The application warns before continuing because the operation can overwrite resources. Import is not a merge: fields are not combined with the previous copy.",
        ],
      },
      {
        id: "source-settings",
        title: "Source settings, dependencies, and permissions",
        paragraphs: [],
        blocks: [
          {
            text: "The source settings page edits the source metadata. The name is localized and can have a value for each supported language. The code is the short identifier shown in lists and cards. The type and version describe the source family and ruleset version.",
            type: "paragraph",
          },
          {
            text: "`Includes` and `Requires` describe relationships between sources. An included source is displayed as part of the active source's content.",
            type: "paragraph",
          },
          {
            text: "For example, if `The Annals of Valelight` includes the `System Reference Document (SRD)`, the Spells section also shows the spells from `SRD`.",
            type: "example",
          },
          {
            text: "A required source is reference content used by the active source, for example equipment referenced by a creature.",
            type: "paragraph",
          },
          {
            text: "For example, if `The Annals of Valelight` requires `SRD`, you can use equipment from `SRD` as reference content in a creature's equipment fields.",
            type: "example",
          },
          {
            text: "Resources from required sources do not appear in resource lists. They are available only as reference content, such as in selectors and lookup fields.",
            type: "warning",
          },
          {
            text: "Catalog permissions control editing and publishing. `Viewer` access allows downloading and using a source but not changing its catalog content. `Editor` access allows local changes and publishing those changes. The source creator can manage access. Local sources have no catalog permission restrictions.",
            type: "paragraph",
          },
        ],
      },
      {
        id: "resources",
        title: "Resources, views, and filters",
        paragraphs: [],
        blocks: [
          {
            text: "A resource panel lists one kind of resource from the active source and its included content. Reference resources from required sources are available to selectors and lookups where needed.",
            type: "paragraph",
          },
          {
            text: "The left sidebar has `All` and `Favorites` tabs. Use the star at the top of a resource panel's filters sidebar to add or remove that resource kind from Favorites; this marks the whole kind, not individual resources. Favorites lists the selected kinds alphabetically. The favorite kinds and selected tab are saved in this browser.",
            type: "paragraph",
          },
          {
            text: "`Table view` is optimized for scanning and comparing many entries. `Card view` is optimized for reading the formatted resource and preparing it for printing. The selected view is a presentation choice; both views use the same underlying resources.",
            type: "paragraph",
          },
          {
            text: "The `Card view` has additional options that control how cards are displayed:",
            type: "paragraph",
          },
          {
            items: [
              { text: "Zoom changes the displayed size of the cards." },
              {
                text: "You can choose between scrollable and paginated mode:",
                items: [
                  {
                    text: "Scrollable mode lets text that exceeds the card height scroll inside the card.",
                  },
                  {
                    text: "Paginated mode divides the card into pages. Click the left half of a card to go to the previous page or the right half to go to the next page. This is the mode used to generate the print sheet.",
                  },
                ],
              },
              {
                text: "The image option shows or hides card images. Images are available only in paginated mode.",
              },
            ],
            type: "list",
          },
          {
            text: "The `Name` search is intended for quick lookup and matches names in any available language. Other filters narrow the list by properties such as level, school, class, type, rarity, or other fields supported by that resource kind. A filter affects only the current resource panel and source context.",
            type: "paragraph",
          },
          {
            text: "The global search in the top bar has three modes. Press ``⌘K`` (``Ctrl+K`` on Windows) to search resources in the active source and its included or required sources; choose a result to open its detail page. Press ``⌘⇧K`` (``Ctrl+Shift+K`` on Windows) to search installed sources by name or code; choose one to make it active. Press ``⌘⌥K`` (``Ctrl+Alt+K`` on Windows) to search resource kinds in either language and open the corresponding list. You can also switch modes using the tabs in the search window.",
            type: "paragraph",
          },
          {
            text: "Click a resource name in a row or card to open its detail page. The page shows the resource's information and description, with fields depending on its kind. If the resource has an image, click it to open a larger preview.",
            type: "paragraph",
          },
        ],
        example:
          'In the Spells section, searching for "pall" finds both "Fireball" and "Delayed Blast Fireball".',
      },
      {
        id: "resource-actions",
        title: "Resource actions and editing rights",
        paragraphs: [
          "Actions that apply to one resource are available on its row, card, and detail page. Actions that apply to a selection are available in the selection action bar. The exact actions depend on the resource kind.",
          "Catalog sources opened with `Viewer` access cannot be edited. Sources you own, local sources, detached sources, and catalog sources for which you have `Editor` access can be changed. Publishing is a separate action from editing: local changes remain local until explicitly published.",
        ],
        bullets: [
          "Open or edit a single resource when you need to inspect or change its fields.",
          "Select several resources when an action supports batch operation, such as adding them to the `Print Deck` or removing them.",
          "Create a new resource from the resource panel when the active source is editable.",
          "Create a variant only for resource kinds that support variants, currently equipment-related resources.",
          "Use `Make Persistent` on a temporary resource when you want it stored in the source bundle.",
        ],
      },
      {
        id: "resource-editing",
        title: "Create and edit resources",
        paragraphs: [
          "The editor presents the fields appropriate for the selected resource kind. You do not need to fill every optional field. Hidden conditional fields remain part of the form state, so pasting or editing a resource does not discard values merely because a related switch is currently off.",
          "Text fields with a blue background are localized fields. Their value belongs to the currently selected language and does not overwrite the values stored for other languages. Switch language before editing a translated value.",
          "To edit and save a resource:",
        ],
        steps: [
          "Open the resource editor from the resource action.",
          "Edit the fields for the current language and ruleset settings.",
          "`Save` the resource to update the active source and its local bundle.",
          "`Export` or `Publish` the source separately if you want to share the change.",
        ],
        example:
          "A spell's English description and Italian description are separate values. Editing the Italian field does not erase the English field.",
      },
      {
        id: "language",
        title: "Languages and localization",
        paragraphs: [
          "The `Language` selector changes the language used to display localized resource fields and interface labels. Resources may have a translation for one language and not another; missing values are shown as missing rather than copied automatically from a different language.",
          "When editing a localized field, select the language first and edit the value for that language. Source names, resource names, descriptions, and other supported text fields can be localized independently.",
        ],
      },
      {
        id: "units",
        title: "Metric and imperial units",
        paragraphs: [],
        blocks: [
          {
            text: "The `Units` selector changes how supported distances, speeds, weights, and other measurements are displayed. Resource data is stored in one internal format and converted only for display, so switching units does not change the resource itself.",
            type: "paragraph",
          },
          {
            text: "If a measurement is displayed using a unit from the opposite system to the one selected, it is probably an error in the resource data. Please report it.",
            type: "warning",
          },
          {
            text: "The application chooses a readable unit automatically. For example, a sufficiently large metric distance is shown in kilometers instead of meters, while an imperial distance may be shown in miles instead of feet.",
            type: "paragraph",
          },
          {
            text: "The same stored distance can be displayed as 1.5 km in metric mode or 1 mi in imperial mode.",
            type: "example",
          },
        ],
      },
      {
        id: "annotations",
        title: "Text annotations in editors",
        paragraphs: [
          "Multiline text fields marked as supporting text formatting accept lightweight annotations. The markers are written directly in the text and are rendered in resource tables, cards, and the `Print Deck`.",
          "These fields include resource descriptions, equipment notes, creature traits, actions, reactions, lair effects, spell upgrades, and other multiline text fields that display formatted content.",
          "A resource link provides direct access to another resource mentioned in the text, such as a spell referenced in a feature's description. On cards, it opens the linked resource; on the printed sheet, it remains italicized text because a printed card cannot navigate within the app.",
          "In a resource editor, the `Link a resource` button searches resources accessible from the active source and its included or required sources. You can also use ``⌘⌥L`` on macOS or ``Ctrl+Alt+L`` on Windows and Linux. If you select text before opening the search, that text is inserted as the fallback. This command is not available in the Print Deck editor.",
          "When the linked resource is available, the link displays its name in the current language unless custom display text is supplied. If the resource is missing or inaccessible, the fallback is displayed; without a fallback, the interface shows `Missing Resource`.",
        ],
        bullets: [
          `Bold: wrap text in double asterisks, for example ${bold("Important")}.`,
          `Italic: wrap text in underscores, for example ${italic("Concentration")}.`,
          `Heading: wrap text in double hashes, for example ${heading("Actions")}.`,
          `Metric/imperial alternatives: write the metric value first and the imperial value second inside braces, separated by a vertical bar, for example {{1.5 meters|5 feet}}.`,
          `Page break: insert \`:::page-break:::\` to start the following content on a new page in paginated cards. It is hidden in scroll cards, expanded table rows, and resource details. Adjacent whitespace and line breaks are ignored.`,
          `Resource link: use \`[[kind:uuid]]\` to display the localized resource name, or \`[[kind:uuid:fallback]]\` to specify the text shown if the resource is missing or inaccessible. To override the displayed text when the resource is available, add a fourth element: \`[[kind:uuid:fallback:text]]\`. To omit the fallback, leave the third element empty: \`[[kind:uuid::text]]\`. Colons cannot appear inside the fallback or custom text.`,
        ],
        example: `${heading("Actions")}\n${bold("Rend.")} ${italic("Melee Attack Roll:")} +7, reach {{1.5 m|5 ft}}. ${italic("Hit:")} 14 (2d8 + 5) Slashing damage.`,
        examplePrefix: "Example:",
      },
      {
        id: "variants",
        title: "Variants and temporary resources",
        paragraphs: [
          "A variant is a new resource derived from an existing resource, usually by applying one or more equipment modifiers. It receives its own resource ID and can be edited like other resources.",
          "A `Temporary` resource is kept only in the current session. It is useful for a campaign-specific variant or a quick adjustment that you do not want to add permanently to the source. Temporary resources are not restored after reload and are not exported.",
          "To create a variant and decide whether it should be temporary:",
        ],
        steps: [
          "Open the variant action on a supported equipment resource.",
          "Choose the modifiers and review the generated resource.",
          "Leave `Make Persistent` disabled to create a temporary variant.",
          "Enable `Make Persistent` when the variant should become part of the source and survive reloads.",
        ],
        example:
          "A +1 Dagger created for one session can remain temporary. If it becomes part of the campaign source, create it again or make it persistent.",
      },
      {
        id: "print-deck",
        title: "The Print Deck",
        paragraphs: [
          "The `Print Deck` is a separate, persistent collection of resource cards. It can contain resources from different sources and resource kinds. Adding a resource copies the current localized presentation into a deck entry; it does not move or remove the resource from its source.",
          "To add and remove cards:",
        ],
        steps: [
          "Select one or more resources in a resource panel.",
          "Use the selection action to add them to the `Print Deck`.",
          "Open `Print Deck` from the main navigation.",
          "Remove entries from the deck when they are no longer needed.",
        ],
      },
      {
        id: "print-editing",
        title: "Editing cards in the Print Deck",
        paragraphs: [
          "A `Print Deck` entry can be edited independently. You can adjust its displayed content and color for printing without changing the original resource in its source. This is useful for correcting inaccuracies in the printed card or tailoring its information to your needs.",
          "The deck stores its own entries locally. Changes to a source resource do not silently rewrite the manual changes you made to a deck entry.",
        ],
        example:
          "Changing the color or title of a spell card in the `Print Deck` changes that card only. The spell in the source remains unchanged.",
      },
      {
        id: "print-options",
        title: "Print options",
        paragraphs: [
          "The `Print Deck` settings control how the card sheet is laid out and rendered before it is sent to the browser print dialog. Each option changes the preview and, where applicable, the printed result:",
        ],
        bullets: [
          "`Layout` selects portrait or landscape orientation for the paper sheet.",
          "`Paper Size` selects the physical paper format, such as A4, A3, A5, Letter, Legal, or Tabloid. The number of cards per sheet is calculated from this size and the selected layout.",
          "`Print Quality` selects Standard or High Fidelity. Standard printing opens the browser print dialog directly. High Fidelity temporarily renders the sheet at twice its normal size to reduce small layout imperfections, so set the browser print scale to 50% to restore the intended final size.",
          "`Bleed` adds a small extension beyond the card boundary to reduce visible white edges after cutting. Enable it and set the horizontal (`Bleed X`) and vertical (`Bleed Y`) extension when you want this margin.",
          "`Crop Marks (Page)` shows marks around the page/card layout. Its length and color control how those marks appear on the sheet.",
          "`Crop Marks (Card)` shows corner marks for individual cards. Its length and color control how those marks appear around each card.",
          "`Include Image` shows or hides resource images on cards when an image is available.",
          "`Include Background` keeps or removes card background colors and other background graphics from the printed result.",
          "`Add Empty Back` adds a blank back when a card occupies an odd number of pages, keeping front and back pages aligned for double-sided printing.",
        ],
      },
      {
        id: "browser-printing",
        title: "Printing through the browser",
        paragraphs: [
          "The `Print` button opens the browser or operating system print dialog. The exact labels vary by browser and printer, but the following settings are important for faithful physical cards.",
          "Before printing, configure the system dialog as follows:",
        ],
        steps: [
          "Choose the correct paper format, usually A4 or Letter according to the paper you are using.",
          "Use portrait or landscape according to the layout shown in the `Print Deck` preview.",
          "Disable browser headers and footers when the dialog offers that option.",
          "Set margins to None or the smallest supported value if the preview expects edge-to-edge content.",
          "Enable background graphics or background colors so card colors and decorative elements are printed.",
          "Use 100% scale for Standard printing. Use 50% scale for High Fidelity printing, because High Fidelity renders the sheet at twice its normal size before opening the browser print dialog.",
        ],
        warning:
          "Depending on the options provided by the browser or operating system print dialog, it may not be possible to print the sheet in High Fidelity or use certain paper formats and options. Printing from a desktop computer using Google Chrome or another Chromium-based browser is recommended.",
      },
    ],
  },
  it: {
    groups: {
      deck: "Mazzo di stampa",
      overview: "Panoramica",
      printing: "Stampa",
      resources: "Lavorare con le risorse",
      sources: "Lavorare con le fonti",
    },
    title: "Documentazione di ZorboDnD",
    intro:
      "ZorboDnD è un'applicazione local-first per organizzare, consultare, modificare e stampare le risorse di D&D. Questa guida documenta i concetti e i flussi dell'app.",
    sections: [
      {
        id: "start",
        title: "Iniziare",
        paragraphs: [
          "L'applicazione funziona principalmente offline. Le fonti scaricate o importate su questo dispositivo vengono caricate nel catalogo locale e rimangono disponibili senza connessione.",
          "Per iniziare a usare l'applicazione, segui questi passaggi:",
        ],
        steps: [
          "Apri `Fonti` e installa una fonte del catalogo, oppure importa un file JSON.",
          "Seleziona la fonte dal selettore nella barra laterale.",
          "Scegli un gruppo di risorse, come `Incantesimi`, `Creature` o `Equipaggiamento`.",
          "Usa la `Vista tabella` per confrontare molte risorse o la `Vista carte` per leggerle.",
          "Seleziona le risorse utili e apri il `mazzo di stampa` quando ti servono carte pronte per il tavolo.",
        ],
      },
      {
        id: "concepts",
        title: "Fonti, risorse e stampa",
        paragraphs: [
          "Una fonte è una raccolta coerente di contenuti di gioco. La SRD, un estratto di un manuale o una fonte di campagna possono essere rappresentati come fonti. Una fonte contiene anche metadati come nome, codice, versione, dipendenze e stato di pubblicazione.",
          "Una risorsa è una singola voce contenuta in una fonte: un incantesimo, una creatura, un oggetto, un'arma, una classe, un talento o un altro tipo di contenuto D&D supportato. Le risorse mantengono il loro identificatore quando vengono importate, modificate o aggiunte al mazzo di stampa.",
          "Il mazzo di stampa è una raccolta personale di carte, cioè rappresentazioni visuali e stampabili delle risorse. È separato dalla fonte: modificare una carta nel mazzo modifica solo quella voce del mazzo, non la risorsa originale.",
        ],
      },
      {
        id: "implementation",
        title: "Implementazione e privacy",
        paragraphs: [
          "L'applicazione è costruita con React e TypeScript, compilata con Vite e stilizzata con Chakra UI.",
          "Le fonti e i bundle delle risorse vengono salvati nel database IndexedDB del browser. Questo permette di mantenere disponibili offline i contenuti scaricati e importati. L'applicazione usa localStorage per le preferenze leggere e le impostazioni locali, come lingua, unità e altre scelte dell'interfaccia.",
          "Supabase viene usato per le funzioni online opzionali, come autenticazione, fonti del catalogo, download, aggiornamenti automatici e pubblicazione. Le fonti e le risorse locali non vengono caricate automaticamente; le richieste di rete avvengono quando usi una funzione online o quando sono abilitati gli aggiornamenti automatici del catalogo.",
          "L'applicazione non usa strumenti di analisi, pubblicità o tracciamento del comportamento. Non crea un profilo delle pagine visitate o delle risorse consultate.",
        ],
      },
      {
        id: "local-remote",
        title: "Fonti locali e del catalogo",
        paragraphs: [
          "Una fonte del catalogo è una fonte pubblicata online, disponibile per il download e per gli aggiornamenti. Può essere di `Sola lettura` o modificabile a seconda dei tuoi permessi. Gli aggiornamenti automatici possono essere disattivati nella pagina `Fonti`.",
          "Una fonte locale esiste solo su questo dispositivo ed è contrassegnata come `Locale`. Una fonte del catalogo può essere resa locale, cioè scollegata, quando vuoi smettere di ricevere aggiornamenti e modificare liberamente la copia. Lo scollegamento non crea una seconda fonte: cambia il modo in cui la copia installata viene gestita.",
          "Finché una fonte è disponibile nel catalogo ma non è stata scaricata, è contrassegnata come `Non installato`. Dopo essere stata scaricata, una fonte del catalogo è contrassegnata come `Installato`.",
        ],
        bullets: [
          "Usa `Scarica` per ottenere una fonte disponibile nel catalogo.",
          "Usa `Rendi locale` quando vuoi trasformare una fonte installata in una copia indipendente.",
          "Usa `Rendi ufficiale` per ricollegare una copia locale scollegata al catalogo. La versione ufficiale viene scaricata e sostituisce la fonte locale, quindi le modifiche locali vengono perse.",
          "Usa `Rimuovi` su una fonte del catalogo per disinstallare la copia locale lasciando disponibile la fonte nel catalogo. Usalo su una fonte locale per eliminare la fonte e le sue risorse dal dispositivo.",
        ],
      },
      {
        id: "source-management",
        title: "Creare, modificare e rimuovere una fonte",
        paragraphs: [
          "Le fonti locali sono completamente modificabili su questo dispositivo. Per crearne una, apri `Fonti` e scegli `Crea fonte`, poi inserisci nome, codice, tipo e versione.",
          "Apri le impostazioni di una fonte per modificarne i metadati e le dipendenze.",
          "Rimuovere una fonte elimina il suo bundle locale e le sue risorse dal dispositivo. Se altre fonti installate dipendono da essa, l'applicazione mostra un avviso prima della rimozione. Esporta prima la fonte se potresti aver bisogno di ripristinarla.",
          "Per creare o gestire una fonte locale:",
        ],
        steps: [
          "Apri `Fonti` e scegli `Crea fonte`.",
          "Inserisci i metadati della fonte e conferma la creazione.",
          "Apri le impostazioni della fonte per modificare metadati, inclusioni e requisiti.",
          "Usa `Rimuovi` per eliminare la fonte locale e le sue risorse.",
        ],
      },
      {
        id: "import-export",
        title: "Importare ed esportare",
        paragraphs: [
          "Una fonte può essere rappresentata come un bundle JSON. Il bundle contiene i metadati della fonte e le sue risorse, inclusi i valori localizzati e le relazioni con le altre fonti.",
          "Le fonti possono essere esportate dalla pagina `Fonti` tramite il comando `Esporta`. La fonte selezionata viene scaricata come bundle JSON completo, che puoi conservare come backup o condividere con un altro utente.",
          "Le fonti possono essere importate dalla pagina `Fonti` tramite il comando `Importa`. Il bundle JSON viene validato, migrato dai formati precedenti quando necessario, salvato localmente e caricato nel catalogo in memoria.",
          "Se la fonte importata esiste già su questo dispositivo, l'importazione sostituisce il contenuto locale. L'applicazione mostra un avviso prima di continuare perché l'operazione può sovrascrivere delle risorse. L'importazione non è un'unione: i campi non vengono combinati con la copia precedente.",
        ],
      },
      {
        id: "source-settings",
        title: "Impostazioni della fonte, dipendenze e permessi",
        paragraphs: [],
        blocks: [
          {
            text: "La pagina delle impostazioni modifica i metadati della fonte. Il nome è localizzato e può avere un valore per ogni lingua supportata. Il codice è l'identificatore breve mostrato negli elenchi e nelle carte. Tipo e versione descrivono la famiglia della fonte e la versione delle regole.",
            type: "paragraph",
          },
          {
            text: "Le sezioni `Include` e `Richiede` descrivono le relazioni tra fonti. Una fonte inclusa viene mostrata insieme ai contenuti della fonte attiva.",
            type: "paragraph",
          },
          {
            text: "Per esempio, se la fonte `Gli Annali di Mezzaluce` include il `System Reference Document (SRD)`, nella sezione Incantesimi vedrai anche gli incantesimi della `SRD`.",
            type: "example",
          },
          {
            text: "Una fonte richiesta contiene materiale di riferimento usato dalla fonte attiva, per esempio l'equipaggiamento referenziato da una creatura.",
            type: "paragraph",
          },
          {
            text: "Per esempio, se la fonte `Gli Annali di Mezzaluce` richiede `SRD`, puoi usare l'equipaggiamento della `SRD` come riferimento nei campi dell'equipaggiamento di una creatura.",
            type: "example",
          },
          {
            text: "Le risorse delle fonti richieste non compaiono negli elenchi delle risorse. Sono disponibili solo come contenuto di riferimento, per esempio nei selettori e nei campi di ricerca.",
            type: "warning",
          },
          {
            text: "I permessi del catalogo controllano modifica e pubblicazione. L'accesso `Lettore` permette di scaricare e usare una fonte, ma non di modificarne il contenuto. L'accesso `Editor` permette modifiche locali e pubblicazione. Il creatore della fonte può gestire gli accessi. Le fonti locali non hanno le restrizioni del catalogo.",
            type: "paragraph",
          },
        ],
      },
      {
        id: "resources",
        title: "Risorse, viste e filtri",
        paragraphs: [],
        blocks: [
          {
            text: "Un pannello risorse elenca un tipo di risorsa della fonte attiva e dei suoi contenuti inclusi. Le risorse di riferimento delle fonti richieste sono disponibili nei selettori e nei lookup quando necessario.",
            type: "paragraph",
          },
          {
            text: "La sidebar sinistra contiene le schede `Tutti` e `Preferiti`. Usa la stella in cima alla sidebar dei filtri di un pannello per aggiungere o rimuovere quel tipo di risorsa dai Preferiti: la scelta riguarda l'intero tipo, non le singole risorse. Preferiti mostra i tipi selezionati in ordine alfabetico. I tipi preferiti e la scheda selezionata vengono salvati in questo browser.",
            type: "paragraph",
          },
          {
            text: "La `Vista tabella` è ottimizzata per scorrere e confrontare molte voci. La `Vista carte` è ottimizzata per leggere la risorsa formattata e prepararla alla stampa. La vista scelta è solo una modalità di presentazione: entrambe usano le stesse risorse.",
            type: "paragraph",
          },
          {
            text: "La `Vista carte` offre opzioni aggiuntive che controllano come vengono visualizzate le carte:",
            type: "paragraph",
          },
          {
            items: [
              { text: "Lo zoom cambia la dimensione visualizzata delle carte." },
              {
                text: "Puoi scegliere tra la modalità a scorrimento e quella paginata:",
                items: [
                  {
                    text: "La modalità a scorrimento permette al testo che supera l'altezza della carta di scorrere all'interno di essa.",
                  },
                  {
                    text: "La modalità paginata divide la carta in pagine. Fai clic sulla metà sinistra della carta per tornare alla pagina precedente o sulla metà destra per passare alla pagina successiva. Questa è la modalità usata per generare il foglio di stampa.",
                  },
                ],
              },
              {
                text: "L'opzione per le immagini permette di mostrare o nascondere le immagini delle carte. Le immagini sono disponibili solo nella modalità paginata.",
              },
            ],
            type: "list",
          },
          {
            text: "La ricerca per `Nome` serve per trovare rapidamente una voce e considera i nomi in tutte le lingue disponibili. Gli altri filtri restringono l'elenco per proprietà come livello, scuola, classe, tipo, rarità o altri campi supportati dal tipo di risorsa.",
            type: "paragraph",
          },
          {
            text: "La ricerca globale nella barra superiore ha tre modalità. Premi ``⌘K`` (``Ctrl+K`` su Windows) per cercare le risorse della fonte attiva e delle fonti incluse o richieste; selezionando un risultato si apre la relativa pagina di dettaglio. Premi ``⌘⇧K`` (``Ctrl+Shift+K`` su Windows) per cercare le fonti installate per nome o codice; selezionandone una, diventa la fonte attiva. Premi ``⌘⌥K`` (``Ctrl+Alt+K`` su Windows) per cercare i tipi di risorsa in entrambe le lingue e aprire il relativo elenco. Puoi anche cambiare modalità usando i tab della finestra di ricerca.",
            type: "paragraph",
          },
          {
            text: "Fai clic sul nome di una risorsa, in una riga o in una carta, per aprire la pagina di dettaglio. La pagina mostra le informazioni e la descrizione della risorsa, con campi che variano in base al tipo. Se la risorsa ha un'immagine, fai clic su di essa per aprire un'anteprima più grande.",
            type: "paragraph",
          },
        ],
        example:
          'Nella sezione Incantesimi, cercando "fireb" trovi sia "Palla di Fuoco" sia "Palla di Fuoco Ritardata".',
      },
      {
        id: "resource-actions",
        title: "Azioni sulle risorse e diritti di modifica",
        paragraphs: [
          "Le azioni che si applicano a una singola risorsa sono disponibili sulla riga, sulla carta e nella pagina di dettaglio. Le azioni che si applicano a una selezione sono disponibili nella barra delle azioni della selezione. Le azioni esatte dipendono dal tipo di risorsa.",
          "Le fonti del catalogo aperte con accesso `Lettore` non possono essere modificate. Le fonti di cui sei proprietario, locali, scollegate e quelle per cui hai accesso `Editor` possono essere modificate. Pubblicare è un'azione separata dalla modifica: le modifiche rimangono locali finché non vengono pubblicate esplicitamente.",
        ],
        bullets: [
          "Apri o modifica una singola risorsa per esaminarne o cambiarne i campi.",
          "Seleziona più risorse quando un'azione supporta operazioni multiple, come aggiungerle al `mazzo di stampa` o rimuoverle.",
          "Crea una nuova risorsa dal pannello quando la fonte attiva è modificabile.",
          "Crea una variante solo per i tipi che la supportano, attualmente le risorse legate all'equipaggiamento.",
          "Usa `Rendi persistente` su una risorsa temporanea quando vuoi conservarla nel bundle della fonte.",
        ],
      },
      {
        id: "resource-editing",
        title: "Creare e modificare risorse",
        paragraphs: [
          "L'editor mostra i campi appropriati per il tipo di risorsa selezionato. Non è necessario compilare ogni campo opzionale. I campi condizionali rimangono nello stato del form anche quando sono nascosti, quindi incollare o modificare una risorsa non elimina i valori solo perché un interruttore correlato è disattivato.",
          "I campi testuali con sfondo blu sono localizzati. Il loro valore appartiene alla lingua selezionata e non sovrascrive i valori delle altre lingue. Cambia lingua prima di modificare un testo tradotto.",
          "Per modificare e salvare una risorsa:",
        ],
        steps: [
          "Apri l'editor dalle azioni della risorsa.",
          "Modifica i campi per la lingua corrente e le impostazioni del sistema di regole.",
          "`Salva` la risorsa per aggiornare la fonte attiva e il suo bundle locale.",
          "`Esporta` o `Pubblica` la fonte separatamente se vuoi condividere la modifica.",
        ],
        example:
          "La descrizione inglese e quella italiana di un incantesimo sono valori separati. Modificare il campo italiano non cancella quello inglese.",
      },
      {
        id: "language",
        title: "Lingue e localizzazione",
        paragraphs: [
          "Il selettore `Lingua` cambia la lingua usata per mostrare i campi localizzati delle risorse e le etichette dell'interfaccia. Una risorsa può avere una traduzione in una lingua e non in un'altra; i valori mancanti non vengono copiati automaticamente.",
          "Quando modifichi un campo localizzato, seleziona prima la lingua e modifica il valore per quella lingua. Nomi delle fonti, nomi delle risorse, descrizioni e altri campi supportati possono essere localizzati indipendentemente.",
        ],
      },
      {
        id: "units",
        title: "Unità metriche e imperiali",
        paragraphs: [],
        blocks: [
          {
            text: "Il selettore `Unità` cambia la visualizzazione di distanze, velocità, pesi e altre misure supportate. I dati delle risorse sono memorizzati in un unico formato interno e convertiti solo per la visualizzazione, quindi cambiare sistema non modifica la risorsa.",
            type: "paragraph",
          },
          {
            text: "Se una misura viene visualizzata usando un'unità del sistema opposto a quello selezionato, probabilmente si tratta di un errore nei dati della risorsa. In questo caso, ti chiediamo di segnalarlo :)",
            type: "warning",
          },
          {
            text: "L'applicazione sceglie automaticamente un'unità leggibile. Per esempio, una distanza metrica sufficientemente grande viene mostrata in chilometri invece che in metri, mentre una distanza imperiale può essere mostrata in miglia invece che in piedi.",
            type: "paragraph",
          },
          {
            text: "La stessa distanza può essere mostrata come 1,5 km in modalità metrica o 1 mi in modalità imperiale.",
            type: "example",
          },
        ],
      },
      {
        id: "annotations",
        title: "Annotazioni nei campi testuali",
        paragraphs: [
          "I campi di testo multilinea contrassegnati come compatibili con la formattazione supportano annotazioni leggere. I marcatori vengono scritti direttamente nel testo e vengono interpretati nelle tabelle, nelle carte e nel mazzo di stampa.",
          "Questi campi includono descrizioni delle risorse, note dell'equipaggiamento, tratti, azioni, reazioni ed effetti della tana delle creature, miglioramenti degli incantesimi e altri campi multilinea che mostrano contenuti formattati.",
          "Un collegamento a una risorsa serve a raggiungere direttamente un'altra risorsa citata nel testo, per esempio un incantesimo menzionato nella descrizione di un privilegio. Nelle carte permette di aprire la risorsa collegata; nel foglio di stampa resta solo il nome in corsivo, perché la carta stampata non può navigare nell'app.",
          "Nell'editor di una risorsa, il pulsante `Collega una risorsa` apre una ricerca tra le risorse accessibili della fonte attiva e delle fonti incluse o richieste. Puoi usare anche la scorciatoia ``⌘⌥L`` su macOS o ``Ctrl+Alt+L`` su Windows e Linux. Se selezioni del testo prima di aprire la ricerca, quel testo viene inserito come fallback. Il comando non è disponibile nell'editor del mazzo di stampa.",
          "Se la risorsa collegata è disponibile, il collegamento mostra il suo nome nella lingua corrente, a meno che non sia stato specificato un testo alternativo. Se manca o non è accessibile, viene mostrato il fallback; senza fallback, appare l'indicazione `Risorsa Mancante`.",
        ],
        bullets: [
          `Grassetto: racchiudi il testo tra due asterischi, per esempio ${bold("Importante")}."`,
          `Corsivo: racchiudi il testo tra underscore, per esempio ${italic("Concentrazione")}."`,
          `Intestazione: racchiudi il testo tra doppi cancelletto, per esempio ${heading("Azioni")}."`,
          `Valori metrici/imperiali: scrivi prima il valore metrico e poi quello imperiale tra parentesi graffe, separati da una barra verticale, per esempio {{1,5 metri|5 piedi}}."`,
          `Interruzione di pagina: inserisci \`:::page-break:::\` per iniziare il contenuto successivo su una nuova pagina nelle carte paginate. È invisibile nelle carte a scorrimento, nelle righe espanse della tabella e nei dettagli delle risorse. Gli spazi e i ritorni a capo adiacenti vengono ignorati.`,
          `Collegamento a una risorsa: usa \`[[kind:uuid]]\` per mostrare il nome localizzato, oppure \`[[kind:uuid:fallback]]\` per specificare il testo mostrato se la risorsa manca o non è accessibile. Per forzare il testo quando la risorsa è disponibile, aggiungi un quarto elemento: \`[[kind:uuid:fallback:testo]]\`. Se non vuoi un fallback, lascia vuoto il terzo elemento: \`[[kind:uuid::testo]]\`. I due punti non possono comparire nel fallback o nel testo alternativo."`,
        ],
        example: `${heading("Azioni")}\n${bold("Squarcio.")} ${italic("Tiro per colpire in mischia:")} +7, portata {{1,5 m|5 ft}}. ${italic("Colpito:")} 14 (2d8 + 5) danni taglienti.`,
        examplePrefix: "Esempio:",
      },
      {
        id: "variants",
        title: "Varianti e risorse temporanee",
        paragraphs: [
          "Una variante è una nuova risorsa derivata da una risorsa esistente, di solito applicando uno o più modificatori di equipaggiamento. Riceve un proprio ID e può essere modificata come le altre risorse.",
          "Una risorsa `Temporanea` esiste solo nella sessione corrente. È utile per una variante specifica della campagna o per una modifica provvisoria che non vuoi aggiungere definitivamente alla fonte. Le risorse temporanee non vengono ripristinate dopo il reload e non vengono esportate.",
          "Per creare una variante e decidere se deve essere temporanea:",
        ],
        steps: [
          "Apri l'azione variante su una risorsa di equipaggiamento supportata.",
          "Scegli i modificatori e controlla la risorsa generata.",
          "Lascia disattivato `Rendi persistente` per creare una variante temporanea.",
          "Attiva `Rendi persistente` quando la variante deve diventare parte della fonte e sopravvivere al reload.",
        ],
        example:
          "Un Pugnale +1 creato per una sola sessione può rimanere temporaneo. Se diventa parte della campagna, rendilo persistente.",
      },
      {
        id: "print-deck",
        title: "Il mazzo di stampa",
        paragraphs: [
          "Il mazzo di stampa è una raccolta persistente e separata di carte. Può contenere risorse di fonti e tipi diversi. Aggiungere una risorsa copia la sua presentazione nel mazzo: non sposta né rimuove la risorsa dalla fonte.",
          "Per aggiungere e rimuovere carte:",
        ],
        steps: [
          "Seleziona una o più risorse in un pannello.",
          "Usa l'azione della selezione per aggiungerle al `mazzo di stampa`.",
          "Apri il `mazzo di stampa` dalla navigazione principale.",
          "Rimuovi le carte dal mazzo quando non ti servono più.",
        ],
      },
      {
        id: "print-editing",
        title: "Modificare le carte nel mazzo di stampa",
        paragraphs: [
          "Una voce del mazzo di stampa può essere modificata indipendentemente. Puoi cambiare il contenuto visualizzato e il colore della carta da stampare senza modificare la risorsa originale nella fonte. È utile per correggere imprecisioni nella carta stampata o personalizzare le informazioni in base alle tue necessità.",
          "Il mazzo salva le proprie voci localmente. Le modifiche a una risorsa della fonte non riscrivono le modifiche manuali fatte a una carta.",
        ],
        example:
          "Cambiare il colore o il titolo di una carta nel mazzo di stampa modifica solo quella carta. La risorsa nella fonte rimane invariata.",
      },
      {
        id: "print-options",
        title: "Opzioni di stampa",
        paragraphs: [
          "Le impostazioni del `mazzo di stampa` controllano come il foglio di carte viene disposto e visualizzato prima di essere inviato al dialogo di stampa del browser. Ogni opzione modifica l'anteprima e, quando applicabile, il risultato stampato:",
        ],
        bullets: [
          "`Layout` seleziona l'orientamento verticale o orizzontale del foglio.",
          "`Dimensione pagina` seleziona il formato della carta fisica, come A4, A3, A5, Letter, Legale o Tabloid. Il numero di carte per foglio viene calcolato in base a questo formato e all'orientamento selezionato.",
          "`Qualità di stampa` seleziona la stampa Standard o ad Alta Fedeltà. La stampa standard apre direttamente il dialogo di stampa del browser. L'Alta Fedeltà renderizza temporaneamente il foglio al doppio della dimensione normale per ridurre piccole imperfezioni del layout, quindi devi impostare la scala al 50% nel dialogo di stampa del browser per ottenere la dimensione finale prevista.",
          "`Bleed` aggiunge un'estensione oltre il bordo della carta per ridurre i bordi bianchi visibili dopo il taglio. Attivalo e imposta l'estensione orizzontale (`Bleed X`) e verticale (`Bleed Y`) quando vuoi questo margine.",
          "`Marchi (Pagina)` mostra i segni attorno alla disposizione di pagine e carte. La lunghezza e il colore controllano l'aspetto dei segni sul foglio.",
          "`Marchi (Carta)` mostra i segni agli angoli delle singole carte. La lunghezza e il colore controllano l'aspetto dei segni attorno a ogni carta.",
          "`Includi immagine` mostra o nasconde le immagini delle risorse sulle carte quando un'immagine è disponibile.",
          "`Includi sfondo` mantiene o rimuove i colori di sfondo e gli altri elementi grafici di sfondo dal risultato stampato.",
          "`Aggiungi retro vuoto` aggiunge un retro vuoto quando una carta occupa un numero dispari di pagine, mantenendo allineati i fronti e i retro nella stampa fronte-retro.",
        ],
      },
      {
        id: "browser-printing",
        title: "Stampare tramite il browser",
        paragraphs: [
          "Il pulsante `Stampa` apre il dialogo di stampa del browser o del sistema operativo. Le etichette cambiano a seconda del browser e della stampante, ma le seguenti impostazioni sono importanti per ottenere carte fedeli all'anteprima.",
          "Prima di stampare, configura il dialogo di sistema come segue:",
        ],
        steps: [
          "Scegli il formato carta corretto, di solito A4 o Letter in base alla carta utilizzata.",
          "Usa orientamento verticale o orizzontale in base al layout mostrato nell'anteprima.",
          "Disattiva intestazioni e piè di pagina del browser quando l'opzione è disponibile.",
          "Imposta i margini su `Nessuno` o sul valore minimo supportato se l'anteprima prevede contenuto vicino ai bordi.",
          "Abilita la grafica o i colori di sfondo per stampare colori e decorazioni delle carte.",
          "Usa scala 100% per la stampa Standard. Usa scala 50% per la stampa ad Alta Fedeltà, perché l'Alta Fedeltà renderizza il foglio al doppio della dimensione normale prima di aprire il dialogo di stampa del browser.",
        ],
        warning:
          "A seconda delle opzioni offerte dal dialogo di stampa del browser o del sistema operativo, potrebbe non essere possibile stampare il foglio ad Alta Fedeltà o usare determinati formati e opzioni. Si consiglia di stampare da un computer desktop usando Google Chrome o un altro browser basato su Chromium.",
      },
    ],
  },
};
