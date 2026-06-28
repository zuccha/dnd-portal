import { createIcon } from "@chakra-ui/react";

const SquareIcon = createIcon({
  defaultProps: {
    size: "md",
  },
  displayName: "SquareIcon",
  path: (
    <rect
      fill="white"
      height="14"
      rx="2"
      stroke="black"
      strokeWidth="2"
      width="14"
      x="5"
      y="5"
    />
  ),
  viewBox: "0 0 24 24",
});

export default SquareIcon;
