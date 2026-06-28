import { createIcon } from "@chakra-ui/react";

const SquareCheckIcon = createIcon({
  defaultProps: {
    size: "md",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
  },
  displayName: "SquareCheckIcon",
  path: (
    <>
      <rect fill="currentColor" height="16" rx="2" width="16" x="4" y="4" />
      <path
        d="m9 12 2 2 4-4"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </>
  ),
  viewBox: "0 0 24 24",
});

export default SquareCheckIcon;
