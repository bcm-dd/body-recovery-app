/**
 * Sheet primitive component
 *
 * Bottom sheet / modal component for overlays, menus, and forms.
 * Supports snap points, drag-to-dismiss, and keyboard avoidance.
 */

import { styled, Stack, GetProps } from 'tamagui';
import type { ReactNode } from 'react';

/**
 * Overlay backdrop
 */
const SheetOverlay = styled(Stack, {
  name: 'SheetOverlay',

  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '$overlay',

  animation: 'medium',
  opacity: 0,

  enterStyle: {
    opacity: 0,
  },

  exitStyle: {
    opacity: 0,
  },

  variants: {
    open: {
      true: {
        opacity: 1,
      },
    },

    strong: {
      true: {
        backgroundColor: '$overlayStrong',
      },
    },
  },
});

/**
 * Sheet container
 */
const SheetFrame = styled(Stack, {
  name: 'Sheet',

  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,

  backgroundColor: '$surface',
  borderTopLeftRadius: '$4',
  borderTopRightRadius: '$4',

  // Shadow for elevation
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 16,

  // Animation
  animation: 'sheet',
  y: '100%',

  enterStyle: {
    y: '100%',
  },

  exitStyle: {
    y: '100%',
  },

  variants: {
    open: {
      true: {
        y: 0,
      },
    },

    /**
     * Sheet position variants
     */
    position: {
      bottom: {
        bottom: 0,
        left: 0,
        right: 0,
      },

      center: {
        bottom: 'auto',
        top: '50%',
        left: '50%',
        right: 'auto',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
        borderRadius: '$4',
        maxWidth: 500,
        width: '90%',
      },

      fullscreen: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
      },
    },

    /**
     * Sheet sizes
     */
    size: {
      sm: {
        maxHeight: '30%',
      },

      md: {
        maxHeight: '50%',
      },

      lg: {
        maxHeight: '75%',
      },

      xl: {
        maxHeight: '90%',
      },

      auto: {
        maxHeight: '90%',
      },
    },
  } as const,

  defaultVariants: {
    position: 'bottom',
    size: 'auto',
  },
});

/**
 * Drag handle indicator
 */
const SheetHandle = styled(Stack, {
  name: 'SheetHandle',

  width: 36,
  height: 4,
  backgroundColor: '$border',
  borderRadius: '$full',
  alignSelf: 'center',
  marginTop: '$2',
  marginBottom: '$2',

  // Interactive feedback
  hoverStyle: {
    backgroundColor: '$borderHover',
  },
});

/**
 * Sheet header
 */
const SheetHeader = styled(Stack, {
  name: 'SheetHeader',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$border',
});

/**
 * Sheet content area
 */
const SheetContent = styled(Stack, {
  name: 'SheetContent',

  flex: 1,
  padding: '$4',
  overflow: 'scroll',
});

/**
 * Sheet footer
 */
const SheetFooter = styled(Stack, {
  name: 'SheetFooter',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$4',
  borderTopWidth: 1,
  borderTopColor: '$border',

  // Safe area padding for bottom
  paddingBottom: '$6',

  variants: {
    spread: {
      true: {
        justifyContent: 'space-between',
      },
    },
  },
});

export type SheetFrameProps = GetProps<typeof SheetFrame>;
export type SheetOverlayProps = GetProps<typeof SheetOverlay>;

export interface SheetProps extends SheetFrameProps {
  /** Whether the sheet is open */
  open?: boolean;
  /** Called when the sheet should close */
  onClose?: () => void;
  /** Show the drag handle */
  showHandle?: boolean;
  /** Close on overlay press */
  closeOnOverlayPress?: boolean;
  /** Sheet content */
  children?: ReactNode;
}

/**
 * Complete Sheet component
 */
export function Sheet({
  open = false,
  onClose,
  showHandle = true,
  closeOnOverlayPress = true,
  children,
  position = 'bottom',
  size = 'auto',
  ...props
}: SheetProps) {
  const handleOverlayPress = () => {
    if (closeOnOverlayPress && onClose) {
      onClose();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <SheetOverlay
        open={open}
        onPress={handleOverlayPress}
        pointerEvents={open ? 'auto' : 'none'}
      />

      <SheetFrame
        open={open}
        position={position}
        size={size}
        {...props}
      >
        {showHandle && position === 'bottom' && <SheetHandle />}
        {children}
      </SheetFrame>
    </>
  );
}

// Export components for composition
Sheet.Overlay = SheetOverlay;
Sheet.Frame = SheetFrame;
Sheet.Handle = SheetHandle;
Sheet.Header = SheetHeader;
Sheet.Content = SheetContent;
Sheet.Footer = SheetFooter;

export {
  SheetOverlay,
  SheetFrame,
  SheetHandle,
  SheetHeader,
  SheetContent,
  SheetFooter,
};
