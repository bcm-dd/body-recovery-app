/**
 * Text primitive component
 *
 * Semantic text variants for headings, body text, captions, and labels.
 * Follows the typography system defined in tokens.
 */

import type { GetProps } from 'tamagui';
import { styled, Text as TamaguiText } from 'tamagui';

/**
 * Base text component with semantic variants
 */
export const Text = styled(TamaguiText, {
  name: 'Text',

  color: '$textPrimary',
  fontFamily: '$body',

  variants: {
    /**
     * Semantic text variants
     */
    variant: {
      // Headings
      h1: {
        fontSize: '$10',
        lineHeight: '$10',
        fontWeight: '700',
        fontFamily: '$heading',
        letterSpacing: -1,
      },

      h2: {
        fontSize: '$9',
        lineHeight: '$9',
        fontWeight: '700',
        fontFamily: '$heading',
        letterSpacing: -0.5,
      },

      h3: {
        fontSize: '$8',
        lineHeight: '$8',
        fontWeight: '600',
        fontFamily: '$heading',
        letterSpacing: -0.25,
      },

      h4: {
        fontSize: '$7',
        lineHeight: '$7',
        fontWeight: '600',
        fontFamily: '$heading',
      },

      h5: {
        fontSize: '$6',
        lineHeight: '$6',
        fontWeight: '600',
        fontFamily: '$heading',
      },

      h6: {
        fontSize: '$5',
        lineHeight: '$5',
        fontWeight: '600',
        fontFamily: '$heading',
      },

      // Body text
      body: {
        fontSize: '$5',
        lineHeight: '$5',
        fontWeight: '400',
      },

      bodyLarge: {
        fontSize: '$6',
        lineHeight: '$6',
        fontWeight: '400',
      },

      bodySmall: {
        fontSize: '$4',
        lineHeight: '$4',
        fontWeight: '400',
      },

      // UI text
      label: {
        fontSize: '$4',
        lineHeight: '$4',
        fontWeight: '500',
      },

      caption: {
        fontSize: '$3',
        lineHeight: '$3',
        fontWeight: '400',
        color: '$textSecondary',
      },

      captionSmall: {
        fontSize: '$2',
        lineHeight: '$2',
        fontWeight: '400',
        color: '$textMuted',
      },

      // Special purpose
      button: {
        fontSize: '$4',
        lineHeight: '$4',
        fontWeight: '600',
      },

      mono: {
        fontFamily: '$mono',
        fontSize: '$4',
        lineHeight: '$4',
      },
    },

    /**
     * Color variants
     */
    color: {
      primary: {
        color: '$textPrimary',
      },
      secondary: {
        color: '$textSecondary',
      },
      muted: {
        color: '$textMuted',
      },
      success: {
        color: '$success',
      },
      warning: {
        color: '$warning',
      },
      error: {
        color: '$error',
      },
      accent: {
        color: '$primary',
      },
    },

    /**
     * Text alignment
     */
    align: {
      left: {
        textAlign: 'left',
      },
      center: {
        textAlign: 'center',
      },
      right: {
        textAlign: 'right',
      },
    },

    /**
     * Font weight override
     */
    weight: {
      normal: {
        fontWeight: '400',
      },
      medium: {
        fontWeight: '500',
      },
      semibold: {
        fontWeight: '600',
      },
      bold: {
        fontWeight: '700',
      },
    },

    /**
     * Truncation
     */
    truncate: {
      true: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },

    /**
     * Uppercase transform
     */
    uppercase: {
      true: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

export type TextProps = GetProps<typeof Text>;

/**
 * Heading components for convenience
 */
export const H1 = styled(Text, {
  name: 'H1',
  tag: 'h1',
  variant: 'h1',
});

export const H2 = styled(Text, {
  name: 'H2',
  tag: 'h2',
  variant: 'h2',
});

export const H3 = styled(Text, {
  name: 'H3',
  tag: 'h3',
  variant: 'h3',
});

export const H4 = styled(Text, {
  name: 'H4',
  tag: 'h4',
  variant: 'h4',
});

export const H5 = styled(Text, {
  name: 'H5',
  tag: 'h5',
  variant: 'h5',
});

export const H6 = styled(Text, {
  name: 'H6',
  tag: 'h6',
  variant: 'h6',
});

/**
 * Paragraph component
 */
export const Paragraph = styled(Text, {
  name: 'Paragraph',
  tag: 'p',
  variant: 'body',
});

/**
 * Label component for form fields
 */
export const Label = styled(Text, {
  name: 'Label',
  tag: 'label',
  variant: 'label',
});

/**
 * Caption component for supplementary text
 */
export const Caption = styled(Text, {
  name: 'Caption',
  tag: 'span',
  variant: 'caption',
});
