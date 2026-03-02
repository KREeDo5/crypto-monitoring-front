import "@mui/material/styles";
import "@mui/material/Typography";
import type * as React from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    tableHeader: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    tableHeader?: React.CSSProperties;
  }

  interface TypeBackground {
    componentPrimary: string;
    componentSecondary: string;
  }

  interface Palette {
    aiGradient: {
      start: string;
      end: string;
      background: string;
    };
  }

  interface PaletteOptions {
    aiGradient?: {
      start: string;
      end: string;
      background: string;
    };
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    tableHeader: true;
  }
}
