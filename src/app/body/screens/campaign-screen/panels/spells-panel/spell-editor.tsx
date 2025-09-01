import type { Spell } from "../../../../../../resources/spell";

//------------------------------------------------------------------------------
// Spell Editor
//------------------------------------------------------------------------------

export type SpellEditorProps = {
  resource: Spell;
};

export default function SpellEditor({ resource }: SpellEditorProps) {
  return resource.id;
}
