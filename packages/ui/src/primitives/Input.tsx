/**
 * Input primitive component
 *
 * Text input field with variants for different states and sizes.
 * Includes label and error message support.
 */

import type { ReactNode } from 'react';
import type { GetProps } from 'tamagui';
import { styled, Stack, Input as TamaguiInput } from 'tamagui';

import { Text, Label } from './Text';


/**
 * Input container
 */
const InputContainer = styled(Stack, {
  name: 'InputContainer',

  width: '100%',
  gap: '$2',
});

/**
 * Base input field
 */
const InputFrame = styled(TamaguiInput, {
  name: 'Input',

  backgroundColor: '$surface',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$2',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  color: '$textPrimary',
  fontSize: '$5',

  // Placeholder styling
  placeholderTextColor: '$textMuted',

  // Focus state
  focusStyle: {
    borderColor: '$primary',
    outlineWidth: 2,
    outlineColor: '$primary',
    outlineStyle: 'solid',
    outlineOffset: 0,
  },

  // Hover state
  hoverStyle: {
    borderColor: '$borderHover',
  },

  // Disabled state
  disabledStyle: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '$surfacePress',
  },

  variants: {
    /**
     * Input variants
     */
    variant: {
      default: {
        backgroundColor: '$surface',
        borderColor: '$border',
      },

      filled: {
        backgroundColor: '$surfacePress',
        borderColor: 'transparent',
        focusStyle: {
          backgroundColor: '$surface',
          borderColor: '$primary',
        },
      },

      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        paddingHorizontal: 0,
        focusStyle: {
          borderColor: 'transparent',
        },
      },
    },

    /**
     * Input sizes
     */
    size: {
      sm: {
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        fontSize: '$4',
        borderRadius: '$1',
      },

      md: {
        paddingHorizontal: '$4',
        paddingVertical: '$3',
        fontSize: '$5',
        borderRadius: '$2',
      },

      lg: {
        paddingHorizontal: '$5',
        paddingVertical: '$4',
        fontSize: '$6',
        borderRadius: '$3',
      },
    },

    /**
     * Error state
     */
    error: {
      true: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
          outlineColor: '$error',
        },
      },
    },

    /**
     * Success state
     */
    success: {
      true: {
        borderColor: '$success',
        focusStyle: {
          borderColor: '$success',
          outlineColor: '$success',
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

/**
 * Error message text
 */
const ErrorMessage = styled(Text, {
  name: 'ErrorMessage',

  fontSize: '$3',

  // Apply error color via the color variant
  defaultVariants: {
    color: 'error',
  },
});

/**
 * Helper text
 */
const HelperText = styled(Text, {
  name: 'HelperText',

  fontSize: '$3',

  // Apply secondary color via the color variant
  defaultVariants: {
    color: 'secondary',
  },
});

/**
 * Input wrapper with icons
 */
const InputWrapper = styled(Stack, {
  name: 'InputWrapper',

  position: 'relative',
  width: '100%',
});

/**
 * Icon container (left or right)
 */
const IconContainer = styled(Stack, {
  name: 'IconContainer',

  position: 'absolute',
  top: 0,
  bottom: 0,
  justifyContent: 'center',
  paddingHorizontal: '$3',

  variants: {
    side: {
      left: {
        left: 0,
      },
      right: {
        right: 0,
      },
    },
  },
});

export type InputFrameProps = GetProps<typeof InputFrame>;

export interface InputProps extends InputFrameProps {
  /** Label text */
  label?: string;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Left icon */
  leftIcon?: ReactNode;
  /** Right icon */
  rightIcon?: ReactNode;
  /** Required field indicator */
  required?: boolean;
}

/**
 * Complete Input component with label and error states
 */
export function Input({
  label,
  errorMessage,
  helperText,
  leftIcon,
  rightIcon,
  required,
  error,
  size = 'md',
  variant = 'default',
  ...props
}: InputProps) {
  const hasError = error || !!errorMessage;

  // Calculate padding for icons
  const paddingLeft = leftIcon ? (size === 'sm' ? '$8' : size === 'lg' ? '$12' : '$10') : undefined;
  const paddingRight = rightIcon ? (size === 'sm' ? '$8' : size === 'lg' ? '$12' : '$10') : undefined;

  return (
    <InputContainer>
      {label && (
        <Label>
          {label}
          {required && <Text color="error"> *</Text>}
        </Label>
      )}

      <InputWrapper>
        {leftIcon && (
          <IconContainer side="left">
            {leftIcon}
          </IconContainer>
        )}

        <InputFrame
          error={hasError}
          size={size}
          variant={variant}
          paddingLeft={paddingLeft}
          paddingRight={paddingRight}
          {...props}
        />

        {rightIcon && (
          <IconContainer side="right">
            {rightIcon}
          </IconContainer>
        )}
      </InputWrapper>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {!errorMessage && helperText && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );
}

// Export components for composition
Input.Frame = InputFrame;
Input.Container = InputContainer;
Input.Label = Label;
Input.Error = ErrorMessage;
Input.Helper = HelperText;

export { InputFrame, InputContainer, ErrorMessage, HelperText };
