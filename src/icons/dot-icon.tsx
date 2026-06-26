import { createIcon } from "@chakra-ui/react";

const DotIcon = createIcon({
  defaultProps: {
    size: "md",
  },
  displayName: "DotIcon",
  path: <circle cx="12" cy="12" fill="currentColor" r="6" />,
  viewBox: "0 0 24 24",
});

export default DotIcon;
