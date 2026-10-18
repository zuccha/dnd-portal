import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Button Recipe
//------------------------------------------------------------------------------

const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      subtle: {
        _dark: {
          bg: "colorPalette.muted/90",
          _expanded: {
            bg: "colorPalette.emphasized",
          },
          _hover: {
            bg: "colorPalette.emphasized",
          },
        },
      },
      ghost: {
        _dark: {
          _expanded: {
            bg: "colorPalette.muted/90",
          },
          _hover: {
            bg: "colorPalette.muted/90",
          },
        },
      },
    },
  },
});

//------------------------------------------------------------------------------
// Config
//------------------------------------------------------------------------------

const config = defineConfig({
  theme: {
    recipes: {
      button: buttonRecipe,
    },
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
