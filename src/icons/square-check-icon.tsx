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
      <defs>
        <mask id="check-cut">
          <rect fill="white" height="24" width="24" x="0" y="0" />
          <path
            d="m9 12 2 2 4-4"
            fill="none"
            stroke="black"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </mask>
      </defs>

      <rect
        fill="currentColor"
        height="16"
        mask="url(#check-cut)"
        rx="2"
        width="16"
        x="4"
        y="4"
      />
    </>
  ),
  viewBox: "0 0 24 24",
});

export default SquareCheckIcon;
