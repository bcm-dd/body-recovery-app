import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

type TextVariant =
  | 'hero'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption1'
  | 'caption2'

type TextColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error'

type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant
  color?: TextColor
  weight?: TextWeight
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label'
}

const variantStyles: Record<TextVariant, string> = {
  hero: 'text-hero font-bold tracking-tight',
  title1: 'text-title1 font-bold tracking-tight',
  title2: 'text-title2 font-semibold',
  title3: 'text-title3 font-semibold',
  headline: 'text-headline font-semibold',
  body: 'text-body',
  callout: 'text-callout',
  subhead: 'text-subhead',
  footnote: 'text-footnote',
  caption1: 'text-caption1',
  caption2: 'text-caption2',
}

const colorStyles: Record<TextColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

const weightStyles: Record<TextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const defaultTags: Record<TextVariant, TextProps['as']> = {
  hero: 'h1',
  title1: 'h1',
  title2: 'h2',
  title3: 'h3',
  headline: 'h4',
  body: 'p',
  callout: 'p',
  subhead: 'p',
  footnote: 'p',
  caption1: 'span',
  caption2: 'span',
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant = 'body',
      color = 'primary',
      weight,
      as,
      children,
      ...props
    },
    ref
  ) => {
    const Tag = as || defaultTags[variant] || 'p'

    return (
      <Tag
        // @ts-expect-error - ref type varies by tag
        ref={ref}
        className={cn(
          variantStyles[variant],
          colorStyles[color],
          weight && weightStyles[weight],
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    )
  }
)

Text.displayName = 'Text'
