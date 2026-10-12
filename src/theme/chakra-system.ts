import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        "fg.documentation": {
          value: {
            base: "{colors.gray.700}",
            _dark: "{colors.gray.300}",
          },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
