import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        "bg": {
          DEFAULT: {
            value: {
              _dark: "{colors.gray.950}",
              _light: "{colors.white}",
            },
          },
          emphasized: {
            value: {
              _dark: "{colors.gray.700}",
              _light: "{colors.gray.200}",
            },
          },
          info: {
            value: {
              _dark: "{colors.blue.900}",
              _light: "{colors.blue.50}",
            },
          },
          muted: {
            value: {
              _dark: "{colors.gray.800}",
              _light: "{colors.gray.100}",
            },
          },
          panel: {
            value: {
              _dark: "{colors.gray.900}",
              _light: "{colors.white}",
            },
          },
          subtle: {
            value: {
              _dark: "{colors.gray.900}",
              _light: "{colors.gray.50}",
            },
          },
        },
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
