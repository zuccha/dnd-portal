import { createIcon } from "@chakra-ui/react";

const ListIcon = createIcon({
  defaultProps: {
    size: "md",
  },
  displayName: "ListIcon",
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
      <path d="M21 19H3" />
    </svg>
  ),
});

export default ListIcon;
