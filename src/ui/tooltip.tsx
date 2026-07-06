import { Portal, Tooltip as ChakraTooltip } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Tooltip
//------------------------------------------------------------------------------

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
}

export default function Tooltip({
  showArrow,
  children,
  disabled,
  portalled = true,
  content,
  contentProps,
  portalRef,
  ...rest
}: TooltipProps) {
  if (disabled || !content) return children;

  return (
    <ChakraTooltip.Root {...rest}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal container={portalRef} disabled={!portalled}>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content {...contentProps}>
            {showArrow && (
              <ChakraTooltip.Arrow>
                <ChakraTooltip.ArrowTip />
              </ChakraTooltip.Arrow>
            )}
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
