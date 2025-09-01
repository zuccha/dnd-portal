import type { Weapon } from "../../../../../../resources/weapon";

//----------------------------------------------------------------------------
// Weapon Editor
//----------------------------------------------------------------------------

export type WeaponEditorProps = {
  resource: Weapon;
};

export default function WeaponEditor({ resource }: WeaponEditorProps) {
  return resource.id;
}
