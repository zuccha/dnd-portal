//------------------------------------------------------------------------------
// Responsive Sidebar Default
//------------------------------------------------------------------------------

export function getResponsiveSidebarDefault(): boolean {
  return globalThis.matchMedia?.("(max-width: 47.999em)").matches ?? false;
}
