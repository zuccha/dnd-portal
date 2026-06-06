import {
  Box,
  type BoxProps,
  HStack,
  Popover,
  Portal,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import Button, { type ButtonProps } from "./button";
import Icon from "./icon";
import IconButton from "./icon-button";
import InclusionButton from "./inclusion-button";

//------------------------------------------------------------------------------
// Inclusion Select
//------------------------------------------------------------------------------

export type InclusionSelectProps = Omit<BoxProps, "children"> & {
  buttonProps?: Omit<ButtonProps, "children" | "onClick" | "size">;
  includes: Record<string, boolean | undefined>;
  onValueChange: (partial: Record<string, boolean | undefined>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  size?: ButtonProps["size"];
};

export default function InclusionSelect({
  buttonProps,
  includes,
  onValueChange,
  options,
  placeholder,
  size,
  ...rest
}: InclusionSelectProps) {
  const count = Object.values(includes).filter(
    (include) => include !== undefined,
  ).length;

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    const entries = options.map(({ value }) => [value, undefined]);
    onValueChange(Object.fromEntries(entries));
  };

  return (
    <Popover.Root positioning={{ sameWidth: true }}>
      <Popover.Trigger asChild>
        <Box position="relative" {...rest}>
          <Button
            _hover={{ bgColor: "unset" }}
            fontWeight="normal"
            px={2.5}
            size={size}
            variant="outline"
            w="full"
            {...buttonProps}
          >
            <HStack justify="space-between" w="full">
              <Span overflow="hidden" textAlign="left" textOverflow="ellipsis">
                {count ?
                  options
                    .map((option) =>
                      includes[option.value] === true ? `+${option.label}`
                      : includes[option.value] === false ? `-${option.label}`
                      : "",
                    )
                    .filter(Boolean)
                    .join(", ")
                : <Span color="fg.muted">{placeholder}</Span>}
              </Span>
              <Icon Icon={ChevronDownIcon} color="fg.muted" />
            </HStack>
          </Button>

          {count > 0 && (
            <IconButton
              Icon={XIcon}
              disabled={count === 0}
              onClick={reset}
              position="absolute"
              right={0}
              rounded="full"
              top={0}
              transform={"translate(40%, -40%) scale(0.45)"}
              zIndex={1}
            />
          )}
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content p={2} width="auto">
            <VStack align="flex-start" overflow="hidden">
              {options.map(({ label, value }) => (
                <InclusionButton
                  include={includes[value]}
                  justifyContent={"flex-start"}
                  key={value}
                  onValueChange={(inc) => onValueChange({ [value]: inc })}
                  size="xs"
                  w="full"
                >
                  <Text truncate>{label}</Text>
                </InclusionButton>
              ))}
            </VStack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
