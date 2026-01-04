import { createIcon } from "@chakra-ui/react";

const ListXIcon = createIcon({
  defaultProps: {
    size: "md",
  },
  displayName: "ListXIcon",
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
      <path d="m15.5 18 5 5" />
      <path d="m20.5 18-5 5" />
    </svg>
  ),
});

export default ListXIcon;
