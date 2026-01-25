/**
 * Component Tests
 *
 * Tests for composite UI components: Banner
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the dependencies
vi.mock('tamagui', async () => {
  const React = await import('react');

  const styled = (
    Component: React.ComponentType | string,
    config?: Record<string, unknown>
  ) => {
    const StyledComponent = React.forwardRef<
      HTMLElement,
      React.PropsWithChildren<{
        variant?: string;
        size?: string;
        weight?: string;
        fullBleed?: boolean;
        compact?: boolean;
        position?: string;
        onPress?: () => void;
        onClick?: () => void;
        accessibilityLabel?: string;
        [key: string]: unknown;
      }>
    >((props, ref) => {
      const {
        children,
        variant,
        size,
        weight,
        fullBleed,
        compact,
        position,
        onPress,
        onClick,
        accessibilityLabel,
        ...rest
      } = props;

      const handleClick = (e: React.MouseEvent) => {
        onPress?.();
        onClick?.(e);
      };

      const dataAttrs: Record<string, string | boolean | undefined> = {
        'data-variant': variant,
        'data-size': size,
        'data-weight': weight,
        'data-full-bleed': fullBleed ? 'true' : undefined,
        'data-compact': compact ? 'true' : undefined,
        'data-position': position,
        'data-testid': config?.name as string,
        'aria-label': accessibilityLabel,
      };

      const Tag = typeof Component === 'string' ? Component : 'div';

      return React.createElement(
        Tag,
        { ref, onClick: handleClick, ...rest, ...dataAttrs },
        children
      );
    });

    StyledComponent.displayName = (config?.name as string) || 'StyledComponent';
    return StyledComponent;
  };

  const Stack = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<'div'>>(
    (props, ref) => React.createElement('div', { ref, ...props })
  );
  Stack.displayName = 'Stack';

  const XStack = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<'div'>>(
    (props, ref) =>
      React.createElement('div', {
        ref,
        style: { display: 'flex', flexDirection: 'row' },
        ...props,
      })
  );
  XStack.displayName = 'XStack';

  const YStack = React.forwardRef<HTMLDivElement, React.ComponentPropsWithRef<'div'>>(
    (props, ref) =>
      React.createElement('div', {
        ref,
        style: { display: 'flex', flexDirection: 'column' },
        ...props,
      })
  );
  YStack.displayName = 'YStack';

  const Text = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithRef<'span'> & {
      variant?: string;
      weight?: string;
      color?: string;
    }
  >((props, ref) => {
    const { variant, weight, color, ...rest } = props;
    return React.createElement('span', {
      ref,
      'data-variant': variant,
      'data-weight': weight,
      'data-color': color,
      ...rest,
    });
  });
  Text.displayName = 'Text';

  return {
    styled,
    Stack,
    XStack,
    YStack,
    Text,
    GetProps: {} as never,
  };
});

// Mock the primitives used by Banner
vi.mock('../src/primitives/Text', async () => {
  const React = await import('react');

  const Text = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithRef<'span'> & {
      variant?: string;
      weight?: string;
      color?: string;
    }
  >((props, ref) => {
    const { variant, weight, color, style, ...rest } = props;
    return React.createElement('span', {
      ref,
      'data-variant': variant,
      'data-weight': weight,
      'data-color': color,
      style,
      ...rest,
    });
  });

  const Label = Text;

  return { Text, Label };
});

vi.mock('../src/primitives/Button', async () => {
  const React = await import('react');

  const Button = ({
    children,
    onPress,
    onClick,
    variant,
    size,
    disabled,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    variant?: string;
    size?: string;
    disabled?: boolean;
  }) => {
    const handleClick = (e: React.MouseEvent) => {
      if (disabled) return;
      onPress?.();
      onClick?.(e);
    };

    return React.createElement(
      'button',
      {
        onClick: handleClick,
        disabled,
        'data-variant': variant,
        'data-size': size,
      },
      children
    );
  };

  return { Button };
});

// Import after mocks
import { Banner, BannerFrame, BannerContent, BannerText } from '../src/components/Banner';

describe('Banner Component', () => {
  describe('Rendering', () => {
    it('should render with message', () => {
      render(<Banner message="This is a message" />);
      expect(screen.getByText('This is a message')).toBeInTheDocument();
    });

    it('should render with title and message', () => {
      render(<Banner title="Title" message="Message content" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Message content')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <Banner
          message="With icon"
          icon={<span data-testid="banner-icon">!</span>}
        />
      );
      expect(screen.getByTestId('banner-icon')).toBeInTheDocument();
      expect(screen.getByText('With icon')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render info variant by default', () => {
      render(<Banner message="Info banner" />);
      const banner = screen.getByText('Info banner').closest('[data-variant]');
      expect(banner).toHaveAttribute('data-variant', 'info');
    });

    it('should render info variant', () => {
      render(<Banner variant="info" message="Info" />);
      const banner = screen.getByText('Info').closest('[data-variant]');
      expect(banner).toHaveAttribute('data-variant', 'info');
    });

    it('should render success variant', () => {
      render(<Banner variant="success" message="Success" />);
      const banner = screen.getByText('Success').closest('[data-variant]');
      expect(banner).toHaveAttribute('data-variant', 'success');
    });

    it('should render warning variant', () => {
      render(<Banner variant="warning" message="Warning" />);
      const banner = screen.getByText('Warning').closest('[data-variant]');
      expect(banner).toHaveAttribute('data-variant', 'warning');
    });

    it('should render error variant', () => {
      render(<Banner variant="error" message="Error" />);
      const banner = screen.getByText('Error').closest('[data-variant]');
      expect(banner).toHaveAttribute('data-variant', 'error');
    });
  });

  describe('Dismissible', () => {
    it('should not show dismiss button by default', () => {
      render(<Banner message="Not dismissible" />);
      expect(screen.queryByText('x')).not.toBeInTheDocument();
    });

    it('should show dismiss button when dismissible', () => {
      render(<Banner message="Dismissible" dismissible />);
      expect(screen.getByText('x')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button clicked', () => {
      const handleDismiss = vi.fn();
      render(
        <Banner message="Dismiss me" dismissible onDismiss={handleDismiss} />
      );

      fireEvent.click(screen.getByText('x'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('should have accessible dismiss button', () => {
      render(<Banner message="Accessible" dismissible />);
      const dismissButton = screen.getByLabelText('Dismiss banner');
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should not show action button without actionText', () => {
      render(<Banner message="No action" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should show action button with actionText and onAction', () => {
      const handleAction = vi.fn();
      render(
        <Banner
          message="With action"
          actionText="Learn More"
          onAction={handleAction}
        />
      );

      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should call onAction when action button clicked', () => {
      const handleAction = vi.fn();
      render(
        <Banner
          message="Action banner"
          actionText="Click Me"
          onAction={handleAction}
        />
      );

      fireEvent.click(screen.getByText('Click Me'));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('should use secondary variant for info banner action button', () => {
      render(
        <Banner
          variant="info"
          message="Info"
          actionText="Action"
          onAction={() => {}}
        />
      );

      const button = screen.getByText('Action').closest('button');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('should use ghost variant for non-info banner action button', () => {
      render(
        <Banner
          variant="success"
          message="Success"
          actionText="Action"
          onAction={() => {}}
        />
      );

      const button = screen.getByText('Action').closest('button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
    });
  });

  describe('Layout Options', () => {
    it('should render fullBleed variant', () => {
      render(<Banner message="Full bleed" fullBleed />);
      const banner = screen.getByText('Full bleed').closest('[data-full-bleed]');
      expect(banner).toHaveAttribute('data-full-bleed', 'true');
    });

    it('should render compact variant', () => {
      render(<Banner message="Compact" compact />);
      const banner = screen.getByText('Compact').closest('[data-compact]');
      expect(banner).toHaveAttribute('data-compact', 'true');
    });
  });

  describe('Composition', () => {
    it('should export BannerFrame for composition', () => {
      expect(BannerFrame).toBeDefined();
    });

    it('should export BannerContent for composition', () => {
      expect(BannerContent).toBeDefined();
    });

    it('should export BannerText for composition', () => {
      expect(BannerText).toBeDefined();
    });

    it('should have Banner.Frame attached', () => {
      expect(Banner.Frame).toBeDefined();
    });

    it('should have Banner.Content attached', () => {
      expect(Banner.Content).toBeDefined();
    });

    it('should have Banner.Text attached', () => {
      expect(Banner.Text).toBeDefined();
    });
  });

  describe('Complete Banner', () => {
    it('should render banner with all features', () => {
      const handleDismiss = vi.fn();
      const handleAction = vi.fn();

      render(
        <Banner
          variant="warning"
          title="Warning Title"
          message="Warning message content"
          icon={<span data-testid="warning-icon">!</span>}
          dismissible
          onDismiss={handleDismiss}
          actionText="Fix Now"
          onAction={handleAction}
        />
      );

      // Check all elements are rendered
      expect(screen.getByText('Warning Title')).toBeInTheDocument();
      expect(screen.getByText('Warning message content')).toBeInTheDocument();
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
      expect(screen.getByText('Fix Now')).toBeInTheDocument();
      expect(screen.getByText('x')).toBeInTheDocument();

      // Check interactions work
      fireEvent.click(screen.getByText('Fix Now'));
      expect(handleAction).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('x'));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      render(<Banner message="Accessible banner" />);
      expect(screen.getByText('Accessible banner')).toBeInTheDocument();
    });

    it('should have accessible dismiss button with label', () => {
      render(<Banner message="With dismiss" dismissible />);
      expect(screen.getByLabelText('Dismiss banner')).toBeInTheDocument();
    });
  });
});
