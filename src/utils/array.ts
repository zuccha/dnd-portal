//------------------------------------------------------------------------------
// Join With
//------------------------------------------------------------------------------

export function joinWith(
  items: string[],
  separator: string,
  lastSeparator: string,
): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]}${lastSeparator}${items[1]}`;
  return `${items.slice(0, -1).join(separator)}${lastSeparator}${items.at(-1)}`;
}

//------------------------------------------------------------------------------
// Range
//------------------------------------------------------------------------------

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

//------------------------------------------------------------------------------
// Remove Item
//------------------------------------------------------------------------------

export function removeItem<T>(items: T[], index: number): T[] {
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

//------------------------------------------------------------------------------
// Replace Item
//------------------------------------------------------------------------------

export function replaceItem<T>(items: T[], index: number, item: T): T[] {
  return [...items.slice(0, index), item, ...items.slice(index + 1)];
}

//------------------------------------------------------------------------------
// Drop Last
//------------------------------------------------------------------------------

export function dropLast<T>(items: T[]): T[] {
  return items.slice(0, items.length - 1);
}
