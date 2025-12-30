import { Span } from "@chakra-ui/react";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import type { CampaignRole } from "~/models/types/campaign-role";
import AlbumCard from "~/ui/album-card";
import Checkbox from "~/ui/checkbox";
import Icon from "~/ui/icon";
import Link from "~/ui/link";

//------------------------------------------------------------------------------
// Resources Album Card Header
//------------------------------------------------------------------------------

export type ResourcesAlbumCardHeaderProps = {
  editable?: boolean;
  name: string;
  onEdit: () => void;
  onSelectionChange: (selected: boolean) => void;
  printMode?: boolean;
  selected?: boolean;
  visibility: CampaignRole;
};

export default function ResourcesAlbumCardHeader({
  editable = false,
  name,
  onEdit,
  onSelectionChange,
  printMode = false,
  selected = false,
  visibility,
}: ResourcesAlbumCardHeaderProps) {
  if (printMode)
    return (
      <AlbumCard.Header justifyContent="center" textAlign="center">
        {name}
      </AlbumCard.Header>
    );

  return (
    <AlbumCard.Header>
      {editable ?
        <>
          <Icon
            Icon={visibility === "player" ? EyeIcon : EyeClosedIcon}
            h="full"
            opacity={0.8}
            size="xs"
          />
          <Link color="inherit" onClick={onEdit}>
            {name}
          </Link>
        </>
      : <Span color="inherit">{name}</Span>}

      <Span flex={1} />

      <Checkbox onValueChange={onSelectionChange} size="sm" value={selected} />
    </AlbumCard.Header>
  );
}
