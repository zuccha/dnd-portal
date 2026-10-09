//------------------------------------------------------------------------------
// Responsive Sidebar Default
//------------------------------------------------------------------------------

export const smallScreenMediaQuery = "(max-width: 47.999em)";

export function getResponsiveSidebarDefault(): boolean {
  return globalThis.matchMedia?.(smallScreenMediaQuery).matches ?? false;
}
