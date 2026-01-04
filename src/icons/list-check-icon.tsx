import { createIcon } from "@chakra-ui/react";

const ListCheckIcon = createIcon({
  defaultProps: {
    size: "md",
  },
  displayName: "ListCheckIcon",
  path: (
    <svg
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M21 5H3" />
      <path d="M21 12H3" />
      <path d="M11 19H3" />
      <path d="m15 20 2 2 4-4" />
    </svg>
  ),
});

export default ListCheckIcon;
