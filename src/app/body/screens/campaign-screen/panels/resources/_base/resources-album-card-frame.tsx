import { Span, VStack } from "@chakra-ui/react";
import type { CampaignRole } from "~/models/types/campaign-role";
import AlbumCard, { type AlbumCardProps } from "~/ui/album-card";
import ResourcesAlbumCardHeader from "./resources-album-card-header";

//------------------------------------------------------------------------------
// Resources Album Card Frame
//------------------------------------------------------------------------------

export type ResourcesAlbumCardFrameProps = AlbumCardProps & {
  campaignName: string;
  campaignPage: string;
  campaignRole: CampaignRole;
  contentRef?: React.Ref<HTMLDivElement>;
  editable?: boolean;
  gradientIntensity?: number;
  name: string;
  onEdit: () => void;
  onSelectionChange: (selected: boolean) => void;
  palette?: { footerBg: string; footerFg: string; gradientBg: string };
  printMode?: boolean;
  selected?: boolean;
  zoom?: number;
};

export default function ResourcesAlbumCardFrame({
  campaignName,
  campaignPage,
  campaignRole,
  children,
  contentRef,
  editable = false,
  gradientIntensity,
  name,
  onEdit,
  onSelectionChange,
  palette = defaultPalette,
  printMode = false,
  selected = false,
  zoom,
  ...rest
}: ResourcesAlbumCardFrameProps) {
  const bgImage = `radial-gradient(circle, {colors.bg} 0%, {colors.bg} ${gradientIntensity}%, ${palette.gradientBg} 100%)`;

  return (
    <AlbumCard bgImage={bgImage} style={{ zoom }} {...rest}>
      <ResourcesAlbumCardHeader
        campaignRole={campaignRole}
        editable={editable}
        name={name}
        onEdit={onEdit}
        onSelectionChange={onSelectionChange}
        printMode={printMode}
        selected={selected}
      />

      <VStack flex={1} gap={0} overflow="auto" ref={contentRef} w="full">
        {children}
      </VStack>

      <AlbumCard.Caption
        bgColor={palette.footerBg}
        color={palette.footerFg}
        fontWeight="bold"
      >
        <Span>{campaignName}</Span>
        <Span textTransform="uppercase">{campaignPage}</Span>
      </AlbumCard.Caption>
    </AlbumCard>
  );
}

//------------------------------------------------------------------------------
// Default Palette
//------------------------------------------------------------------------------

const defaultPalette = {
  footerBg: "gray.700",
  footerFg: "gray.50",
  gradientBg: "{colors.gray.100}",
};
