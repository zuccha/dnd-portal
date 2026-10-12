import { Box, type BoxProps, Text } from "@chakra-ui/react";
import { InfoIcon as LucideInfoIcon } from "lucide-react";
import Icon from "./icon";
import Tooltip from "./tooltip";

//------------------------------------------------------------------------------
// Info Icon
//------------------------------------------------------------------------------

export type InfoIconProps = Omit<BoxProps, "children"> & {
  content: React.ReactNode;
  label: string;
};

export default function InfoIcon({ content, label, ...rest }: InfoIconProps) {
  return (
    <Tooltip
      content={
        <Text as="pre" fontFamily="inherit" whiteSpace="pre">
          {content}
        </Text>
      }
      showArrow
    >
      <Box aria-label={label} as="span" cursor="help" display="inline-flex" tabIndex={0} {...rest}>
        <Icon Icon={LucideInfoIcon} boxSize={4} />
      </Box>
    </Tooltip>
  );
}
