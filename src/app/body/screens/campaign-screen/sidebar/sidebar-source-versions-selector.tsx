import {
  type SourceVersion,
  useSourceVersionOptions,
} from "~/models/types/source-version";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Sidebar Source Versions Selector
//------------------------------------------------------------------------------

export type SidebarSourceVersionsSelectorProps = {
  onSourceVersionsChange: (versions: SourceVersion[]) => void;
  sourceVersions: SourceVersion[];
};

export default function SidebarSourceVersionsSelector({
  onSourceVersionsChange,
  sourceVersions,
}: SidebarSourceVersionsSelectorProps) {
  const options = useSourceVersionOptions();

  return (
    <Select.Enum
      multiple
      onValueChange={onSourceVersionsChange}
      options={options}
      positioning={{ slide: true }}
      size="sm"
      value={sourceVersions}
      w="4em"
    />
  );
}
