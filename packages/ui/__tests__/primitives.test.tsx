/**
 * Primitives Component Tests
 *
 * Tests for primitive UI components: Button, Text, Card, Input
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the components since Tamagui styled components are complex
// We'll test the component logic and props handling
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
        color?: string;
        align?: string;
        weight?: string;
        truncate?: boolean;
        uppercase?: boolean;
        fullWidth?: boolean;
        circular?: boolean;
        horizontal?: boolean;
        pressable?: boolean;
        error?: boolean;
        success?: boolean;
        disabled?: boolean;
        noBorder?: boolean;
        spread?: boolean;
        onPress?: () => void;
        onClick?: () => void;
        [key: string]: unknown;
      }>
    >((props, ref) => {
      const {
        children,
        variant,
        size,
        color,
        align,
        weight,
        truncate,
        uppercase,
        fullWidth,
        circular,
        horizontal,
        pressable,
        error,
        success,
        disabled,
        noBorder,
        spread,
        onPress,
        onClick,
        ...rest
      } = props;

      const handleClick = (e: React.MouseEvent) => {
        if (disabled) return;
        onPress?.();
        onClick?.(e);
      };

      const dataAttrs: Record<string, string | boolean | undefined> = {
        'data-variant': variant,
        'data-size': size,
        'data-color': color,
        'data-align': align,
        'data-weight': weight,
        'data-truncate': truncate ? 'true' : undefined,
        'data-uppercase': uppercase ? 'true' : undefined,
        'data-full-width': fullWidth ? 'true' : undefined,
        'data-circular': circular ? 'true' : undefined,
        'data-horizontal': horizontal ? 'true' : undefined,
        'data-pressable': pressable ? 'true' : undefined,
        'data-error': error ? 'true' : undefined,
        'data-success': success ? 'true' : undefined,
        'data-disabled': disabled ? 'true' : undefined,
        'data-no-border': noBorder ? 'true' : undefined,
        'data-spread': spread ? 'true' : undefined,
        'data-testid': config?.name as string,
      };

      const Tag = typeof Component === 'string' ? Component : 'div';

      return React.createElement(
        Tag,
        { ref, onClick: handleClick, disabled, ...rest, ...dataAttrs },
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

  const Text = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithRef<'span'>>(
    (props, ref) => React.createElement('span', { ref, ...props })
  );
  Text.displayName = 'Text';

  const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithRef<'input'>>(
    (props, ref) => React.createElement('input', { ref, ...props })
  );
  Input.displayName = 'Input';

  return {
    styled,
    Stack,
    XStack,
    YStack,
    Text,
    Input,
    GetProps: {} as never,
  };
});

// Import components after mocks
import { Button, ButtonFrame, ButtonText } from '../src/primitives/Button';
import { Text, H1, H2, H3, Paragraph, Label, Caption } from '../src/primitives/Text';
import { Card, CardHeader, CardBody, CardFooter } from '../src/primitives/Card';
import { Input, InputFrame } from '../src/primitives/Input';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByText('Primary').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should render with default size', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByText('Medium').closest('[data-size]');
      expect(button).toHaveAttribute('data-size', 'md');
    });
  });

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText('Primary').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText('Secondary').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'secondary');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText('Ghost').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'ghost');
    });

    it('should render destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByText('Delete').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'destructive');
    });

    it('should render success variant', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByText('Success').closest('[data-variant]');
      expect(button).toHaveAttribute('data-variant', 'success');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText('Small').closest('[data-size]');
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should render medium size', () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByText('Medium').closest('[data-size]');
      expect(button).toHaveAttribute('data-size', 'md');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText('Large').closest('[data-size]');
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should render extra large size', () => {
      render(<Button size="xl">Extra Large</Button>);
      const button = screen.getByText('Extra Large').closest('[data-size]');
      expect(button).toHaveAttribute('data-size', 'xl');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled').closest('[data-disabled]');
      expect(button).toHaveAttribute('data-disabled', 'true');
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      // When loading, children are replaced with spinner
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByTestId('Button');
      expect(button).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Button icon={<span data-testid="left-icon">+</span>}>Add</Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      render(
        <Button iconAfter={<span data-testid="right-icon">-&gt;</span>}>
          Next
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when clicked', () => {
      const handlePress = vi.fn();
      render(<Button onPress={handlePress}>Click</Button>);
      fireEvent.click(screen.getByText('Click'));
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const handlePress = vi.fn();
      render(
        <Button disabled onPress={handlePress}>
          Click
        </Button>
      );
      fireEvent.click(screen.getByText('Click'));
      expect(handlePress).not.toHaveBeenCalled();
    });
  });

  describe('Composition', () => {
    it('should export ButtonFrame for composition', () => {
      expect(ButtonFrame).toBeDefined();
    });

    it('should export ButtonText for composition', () => {
      expect(ButtonText).toBeDefined();
    });
  });
});

describe('Text Component', () => {
  describe('Rendering', () => {
    it('should render text content', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render body variant explicitly', () => {
      render(<Text variant="body">Body text</Text>);
      const text = screen.getByText('Body text');
      expect(text).toHaveAttribute('data-variant', 'body');
    });

    it('should render h1 variant', () => {
      render(<Text variant="h1">Heading 1</Text>);
      expect(screen.getByText('Heading 1')).toHaveAttribute('data-variant', 'h1');
    });

    it('should render h2 variant', () => {
      render(<Text variant="h2">Heading 2</Text>);
      expect(screen.getByText('Heading 2')).toHaveAttribute('data-variant', 'h2');
    });

    it('should render caption variant', () => {
      render(<Text variant="caption">Caption</Text>);
      expect(screen.getByText('Caption')).toHaveAttribute('data-variant', 'caption');
    });

    it('should render label variant', () => {
      render(<Text variant="label">Label</Text>);
      expect(screen.getByText('Label')).toHaveAttribute('data-variant', 'label');
    });
  });

  describe('Color Variants', () => {
    it('should render primary color explicitly', () => {
      render(<Text color="primary">Primary</Text>);
      expect(screen.getByText('Primary')).toHaveAttribute('data-color', 'primary');
    });

    it('should render secondary color', () => {
      render(<Text color="secondary">Secondary</Text>);
      expect(screen.getByText('Secondary')).toHaveAttribute('data-color', 'secondary');
    });

    it('should render success color', () => {
      render(<Text color="success">Success</Text>);
      expect(screen.getByText('Success')).toHaveAttribute('data-color', 'success');
    });

    it('should render error color', () => {
      render(<Text color="error">Error</Text>);
      expect(screen.getByText('Error')).toHaveAttribute('data-color', 'error');
    });
  });

  describe('Weight Variants', () => {
    it('should render with normal weight', () => {
      render(<Text weight="normal">Normal</Text>);
      expect(screen.getByText('Normal')).toHaveAttribute('data-weight', 'normal');
    });

    it('should render with bold weight', () => {
      render(<Text weight="bold">Bold</Text>);
      expect(screen.getByText('Bold')).toHaveAttribute('data-weight', 'bold');
    });

    it('should render with semibold weight', () => {
      render(<Text weight="semibold">Semibold</Text>);
      expect(screen.getByText('Semibold')).toHaveAttribute('data-weight', 'semibold');
    });
  });

  describe('Alignment', () => {
    it('should align left', () => {
      render(<Text align="left">Left</Text>);
      expect(screen.getByText('Left')).toHaveAttribute('data-align', 'left');
    });

    it('should align center', () => {
      render(<Text align="center">Center</Text>);
      expect(screen.getByText('Center')).toHaveAttribute('data-align', 'center');
    });

    it('should align right', () => {
      render(<Text align="right">Right</Text>);
      expect(screen.getByText('Right')).toHaveAttribute('data-align', 'right');
    });
  });

  describe('Heading Components', () => {
    it('should render H1 component', () => {
      render(<H1>Heading 1</H1>);
      expect(screen.getByText('Heading 1')).toBeInTheDocument();
    });

    it('should render H2 component', () => {
      render(<H2>Heading 2</H2>);
      expect(screen.getByText('Heading 2')).toBeInTheDocument();
    });

    it('should render H3 component', () => {
      render(<H3>Heading 3</H3>);
      expect(screen.getByText('Heading 3')).toBeInTheDocument();
    });

    it('should render Paragraph component', () => {
      render(<Paragraph>Paragraph text</Paragraph>);
      expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    });

    it('should render Label component', () => {
      render(<Label>Label text</Label>);
      expect(screen.getByText('Label text')).toBeInTheDocument();
    });

    it('should render Caption component', () => {
      render(<Caption>Caption text</Caption>);
      expect(screen.getByText('Caption text')).toBeInTheDocument();
    });
  });
});

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant explicitly', () => {
      render(<Card variant="default">Default</Card>);
      const card = screen.getByText('Default').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'default');
    });

    it('should render elevated variant', () => {
      render(<Card variant="elevated">Elevated</Card>);
      const card = screen.getByText('Elevated').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'elevated');
    });

    it('should render outlined variant', () => {
      render(<Card variant="outlined">Outlined</Card>);
      const card = screen.getByText('Outlined').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'outlined');
    });

    it('should render ghost variant', () => {
      render(<Card variant="ghost">Ghost</Card>);
      const card = screen.getByText('Ghost').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'ghost');
    });

    it('should render interactive variant', () => {
      render(<Card variant="interactive">Interactive</Card>);
      const card = screen.getByText('Interactive').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'interactive');
    });

    it('should render success variant', () => {
      render(<Card variant="success">Success</Card>);
      const card = screen.getByText('Success').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'success');
    });

    it('should render warning variant', () => {
      render(<Card variant="warning">Warning</Card>);
      const card = screen.getByText('Warning').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'warning');
    });

    it('should render error variant', () => {
      render(<Card variant="error">Error</Card>);
      const card = screen.getByText('Error').closest('[data-variant]');
      expect(card).toHaveAttribute('data-variant', 'error');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Card size="sm">Small</Card>);
      const card = screen.getByText('Small').closest('[data-size]');
      expect(card).toHaveAttribute('data-size', 'sm');
    });

    it('should render medium size', () => {
      render(<Card size="md">Medium</Card>);
      const card = screen.getByText('Medium').closest('[data-size]');
      expect(card).toHaveAttribute('data-size', 'md');
    });

    it('should render large size', () => {
      render(<Card size="lg">Large</Card>);
      const card = screen.getByText('Large').closest('[data-size]');
      expect(card).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('Layout Options', () => {
    it('should render horizontal layout', () => {
      render(<Card horizontal>Horizontal</Card>);
      const card = screen.getByText('Horizontal').closest('[data-horizontal]');
      expect(card).toHaveAttribute('data-horizontal', 'true');
    });

    it('should render full width', () => {
      render(<Card fullWidth>Full Width</Card>);
      const card = screen.getByText('Full Width').closest('[data-full-width]');
      expect(card).toHaveAttribute('data-full-width', 'true');
    });

    it('should render pressable', () => {
      render(<Card pressable>Pressable</Card>);
      const card = screen.getByText('Pressable').closest('[data-pressable]');
      expect(card).toHaveAttribute('data-pressable', 'true');
    });
  });

  describe('Sub-components', () => {
    it('should render CardHeader', () => {
      render(<CardHeader>Header</CardHeader>);
      expect(screen.getByText('Header')).toBeInTheDocument();
    });

    it('should render CardBody', () => {
      render(<CardBody>Body</CardBody>);
      expect(screen.getByText('Body')).toBeInTheDocument();
    });

    it('should render CardFooter', () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardBody>Body Content</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Input variant="default" placeholder="default" />);
      const input = screen.getByPlaceholderText('default');
      expect(input).toHaveAttribute('data-variant', 'default');
    });

    it('should render filled variant', () => {
      render(<Input variant="filled" placeholder="filled" />);
      const input = screen.getByPlaceholderText('filled');
      expect(input).toHaveAttribute('data-variant', 'filled');
    });

    it('should render ghost variant', () => {
      render(<Input variant="ghost" placeholder="ghost" />);
      const input = screen.getByPlaceholderText('ghost');
      expect(input).toHaveAttribute('data-variant', 'ghost');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Input size="sm" placeholder="small" />);
      const input = screen.getByPlaceholderText('small');
      expect(input).toHaveAttribute('data-size', 'sm');
    });

    it('should render medium size', () => {
      render(<Input size="md" placeholder="medium" />);
      const input = screen.getByPlaceholderText('medium');
      expect(input).toHaveAttribute('data-size', 'md');
    });

    it('should render large size', () => {
      render(<Input size="lg" placeholder="large" />);
      const input = screen.getByPlaceholderText('large');
      expect(input).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('States', () => {
    it('should render error state', () => {
      render(<Input error placeholder="error" />);
      const input = screen.getByPlaceholderText('error');
      expect(input).toHaveAttribute('data-error', 'true');
    });

    it('should render with error message', () => {
      render(<Input errorMessage="This field is required" placeholder="error" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should render success state', () => {
      render(<Input success placeholder="success" />);
      const input = screen.getByPlaceholderText('success');
      expect(input).toHaveAttribute('data-success', 'true');
    });

    it('should render disabled state', () => {
      render(<Input disabled placeholder="disabled" />);
      const input = screen.getByPlaceholderText('disabled');
      expect(input).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Helper Text', () => {
    it('should render helper text', () => {
      render(<Input helperText="Enter your email address" placeholder="email" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('should not show helper text when error message is present', () => {
      render(
        <Input
          helperText="Helper text"
          errorMessage="Error message"
          placeholder="input"
        />
      );
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('should show required indicator', () => {
      render(<Input label="Email" required placeholder="email" />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render with left icon', () => {
      render(
        <Input
          leftIcon={<span data-testid="left-icon">@</span>}
          placeholder="email"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('should render with right icon', () => {
      render(
        <Input
          rightIcon={<span data-testid="right-icon">X</span>}
          placeholder="search"
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Composition', () => {
    it('should export InputFrame for composition', () => {
      expect(InputFrame).toBeDefined();
    });

    it('should have Input.Frame attached', () => {
      expect(Input.Frame).toBeDefined();
    });

    it('should have Input.Label attached', () => {
      expect(Input.Label).toBeDefined();
    });

    it('should have Input.Error attached', () => {
      expect(Input.Error).toBeDefined();
    });

    it('should have Input.Helper attached', () => {
      expect(Input.Helper).toBeDefined();
    });
  });
});
