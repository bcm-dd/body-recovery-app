/**
 * Theme Tests
 *
 * Tests for theme tokens, configuration, and theme variants.
 */

import { describe, it, expect } from 'vitest';
import {
  palette,
  space,
  radii,
  fontSize,
  lineHeight,
  fontWeight,
  shadows,
  durations,
  zIndex,
} from '../src/theme/tokens';
import { config } from '../src/theme/config';

describe('Theme Tokens', () => {
  describe('Palette Colors', () => {
    it('should have all neutral colors defined', () => {
      expect(palette.black).toBe('#000000');
      expect(palette.white).toBe('#FFFFFF');
    });

    it('should have gray scale colors', () => {
      expect(palette.gray50).toBe('#F9FAFB');
      expect(palette.gray100).toBe('#F3F4F6');
      expect(palette.gray200).toBe('#E5E7EB');
      expect(palette.gray300).toBe('#D1D5DB');
      expect(palette.gray400).toBe('#9CA3AF');
      expect(palette.gray500).toBe('#6B7280');
      expect(palette.gray600).toBe('#4B5563');
      expect(palette.gray700).toBe('#374151');
      expect(palette.gray800).toBe('#1F2937');
      expect(palette.gray900).toBe('#111827');
      expect(palette.gray950).toBe('#0A0A0A');
    });

    it('should have dark surface colors', () => {
      expect(palette.surface50).toBe('#1A1A1A');
      expect(palette.surface100).toBe('#242424');
      expect(palette.surface200).toBe('#2E2E2E');
    });

    it('should have primary blue colors', () => {
      expect(palette.blue50).toBe('#EFF6FF');
      expect(palette.blue500).toBe('#3B82F6');
      expect(palette.blue600).toBe('#2563EB');
      expect(palette.blue700).toBe('#1D4ED8');
    });

    it('should have success green colors', () => {
      expect(palette.green50).toBe('#F0FDF4');
      expect(palette.green500).toBe('#22C55E');
      expect(palette.green600).toBe('#16A34A');
    });

    it('should have warning amber colors', () => {
      expect(palette.amber50).toBe('#FFFBEB');
      expect(palette.amber500).toBe('#F59E0B');
      expect(palette.amber600).toBe('#D97706');
    });

    it('should have error red colors', () => {
      expect(palette.red50).toBe('#FEF2F2');
      expect(palette.red500).toBe('#EF4444');
      expect(palette.red600).toBe('#DC2626');
    });

    it('should have pain level colors for BodyMap', () => {
      expect(palette.painNone).toBe('#22C55E');
      expect(palette.painMild).toBe('#FCD34D');
      expect(palette.painModerate).toBe('#F59E0B');
      expect(palette.painSevere).toBe('#EF4444');
    });
  });

  describe('Spacing Scale', () => {
    it('should follow 4px base unit', () => {
      expect(space[0]).toBe(0);
      expect(space[1]).toBe(4);
      expect(space[2]).toBe(8);
      expect(space[3]).toBe(12);
      expect(space[4]).toBe(16);
      expect(space[6]).toBe(24);
      expect(space[8]).toBe(32);
    });

    it('should have half steps', () => {
      expect(space[0.5]).toBe(2);
      expect(space[1.5]).toBe(6);
      expect(space[2.5]).toBe(10);
      expect(space[3.5]).toBe(14);
    });

    it('should have a true default value', () => {
      expect(space.true).toBe(16);
    });

    it('should have larger spacing values', () => {
      expect(space[10]).toBe(40);
      expect(space[12]).toBe(48);
      expect(space[16]).toBe(64);
      expect(space[20]).toBe(80);
      expect(space[24]).toBe(96);
      expect(space[32]).toBe(128);
    });
  });

  describe('Border Radius', () => {
    it('should have radius scale', () => {
      expect(radii[0]).toBe(0);
      expect(radii[1]).toBe(4);
      expect(radii[2]).toBe(8);
      expect(radii[3]).toBe(12);
      expect(radii[4]).toBe(16);
      expect(radii[5]).toBe(20);
      expect(radii[6]).toBe(24);
    });

    it('should have full radius for circles', () => {
      expect(radii.full).toBe(9999);
    });

    it('should have a true default value', () => {
      expect(radii.true).toBe(8);
    });
  });

  describe('Z-Index Scale', () => {
    it('should have layering values', () => {
      expect(zIndex[0]).toBe(0);
      expect(zIndex[1]).toBe(100);
      expect(zIndex[2]).toBe(200);
      expect(zIndex[3]).toBe(300);
      expect(zIndex[4]).toBe(400);
      expect(zIndex[5]).toBe(500);
    });

    it('should have special z-index values', () => {
      expect(zIndex.modal).toBe(1000);
      expect(zIndex.toast).toBe(1100);
      expect(zIndex.sheet).toBe(900);
    });
  });

  describe('Font Sizes', () => {
    it('should have font size scale', () => {
      expect(fontSize[1]).toBe(11);
      expect(fontSize[2]).toBe(12);
      expect(fontSize[3]).toBe(13);
      expect(fontSize[4]).toBe(14);
      expect(fontSize[5]).toBe(16);
      expect(fontSize[6]).toBe(18);
      expect(fontSize[7]).toBe(20);
      expect(fontSize[8]).toBe(24);
      expect(fontSize[9]).toBe(32);
      expect(fontSize[10]).toBe(40);
    });

    it('should have a true default value', () => {
      expect(fontSize.true).toBe(16);
    });
  });

  describe('Line Heights', () => {
    it('should have line height scale', () => {
      expect(lineHeight[1]).toBe(16);
      expect(lineHeight[5]).toBe(24);
      expect(lineHeight[9]).toBe(40);
    });

    it('should have a true default value', () => {
      expect(lineHeight.true).toBe(24);
    });
  });

  describe('Font Weights', () => {
    it('should have font weight scale', () => {
      expect(fontWeight[1]).toBe('100');
      expect(fontWeight[4]).toBe('400');
      expect(fontWeight[5]).toBe('500');
      expect(fontWeight[6]).toBe('600');
      expect(fontWeight[7]).toBe('700');
    });

    it('should have a true default value', () => {
      expect(fontWeight.true).toBe('400');
    });
  });

  describe('Shadows', () => {
    it('should have shadow definitions', () => {
      expect(shadows.sm).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.lg).toBeDefined();
      expect(shadows.xl).toBeDefined();
    });

    it('should have proper shadow structure', () => {
      expect(shadows.sm.shadowColor).toBe('#000');
      expect(shadows.sm.shadowOpacity).toBe(0.05);
      expect(shadows.sm.elevation).toBe(1);

      expect(shadows.lg.shadowOpacity).toBe(0.15);
      expect(shadows.lg.elevation).toBe(6);
    });
  });

  describe('Animation Durations', () => {
    it('should have duration values', () => {
      expect(durations.instant).toBe(0);
      expect(durations.fast).toBe(150);
      expect(durations.normal).toBe(200);
      expect(durations.medium).toBe(250);
      expect(durations.slow).toBe(300);
      expect(durations.slower).toBe(500);
    });
  });
});

describe('Theme Configuration', () => {
  it('should export a valid config', () => {
    expect(config).toBeDefined();
  });

  it('should have tokens defined', () => {
    expect(config.tokens).toBeDefined();
    expect(config.tokens.color).toBeDefined();
    expect(config.tokens.space).toBeDefined();
    expect(config.tokens.radius).toBeDefined();
  });

  it('should have dark theme defined', () => {
    expect(config.themes).toBeDefined();
    expect(config.themes.dark).toBeDefined();
  });

  it('should have light theme defined', () => {
    expect(config.themes.light).toBeDefined();
  });

  describe('Dark Theme', () => {
    const darkTheme = config.themes.dark;

    it('should have correct background color', () => {
      expect(darkTheme.background).toBe(palette.gray950);
    });

    it('should have correct surface colors', () => {
      expect(darkTheme.surface).toBe(palette.surface50);
      expect(darkTheme.card).toBe(palette.surface100);
    });

    it('should have correct primary color', () => {
      expect(darkTheme.primary).toBe(palette.blue500);
      expect(darkTheme.primaryHover).toBe(palette.blue600);
    });

    it('should have correct text colors', () => {
      expect(darkTheme.textPrimary).toBe(palette.white);
      expect(darkTheme.textSecondary).toBe(palette.gray400);
      expect(darkTheme.textMuted).toBe(palette.gray500);
    });

    it('should have status colors', () => {
      expect(darkTheme.success).toBe(palette.green500);
      expect(darkTheme.warning).toBe(palette.amber500);
      expect(darkTheme.error).toBe(palette.red500);
    });

    it('should have pain level colors', () => {
      expect(darkTheme.painNone).toBe(palette.painNone);
      expect(darkTheme.painMild).toBe(palette.painMild);
      expect(darkTheme.painModerate).toBe(palette.painModerate);
      expect(darkTheme.painSevere).toBe(palette.painSevere);
    });
  });

  describe('Light Theme', () => {
    const lightTheme = config.themes.light;

    it('should have correct background color', () => {
      expect(lightTheme.background).toBe(palette.gray50);
    });

    it('should have correct surface colors', () => {
      expect(lightTheme.surface).toBe(palette.white);
      expect(lightTheme.card).toBe(palette.white);
    });

    it('should have correct primary color', () => {
      expect(lightTheme.primary).toBe(palette.blue600);
      expect(lightTheme.primaryHover).toBe(palette.blue700);
    });

    it('should have correct text colors', () => {
      expect(lightTheme.textPrimary).toBe(palette.gray900);
      expect(lightTheme.textSecondary).toBe(palette.gray600);
    });
  });

  describe('Component Sub-Themes', () => {
    it('should have Button sub-theme for dark mode', () => {
      expect(config.themes.dark_Button).toBeDefined();
      expect(config.themes.dark_Button.background).toBe(palette.blue500);
    });

    it('should have Button sub-theme for light mode', () => {
      expect(config.themes.light_Button).toBeDefined();
      expect(config.themes.light_Button.background).toBe(palette.blue600);
    });

    it('should have Card sub-theme for dark mode', () => {
      expect(config.themes.dark_Card).toBeDefined();
    });

    it('should have Card sub-theme for light mode', () => {
      expect(config.themes.light_Card).toBeDefined();
    });
  });

  describe('Media Queries', () => {
    it('should have responsive breakpoints', () => {
      expect(config.media).toBeDefined();
      expect(config.media.xs).toEqual({ maxWidth: 660 });
      expect(config.media.sm).toEqual({ maxWidth: 800 });
      expect(config.media.md).toEqual({ maxWidth: 1020 });
      expect(config.media.lg).toEqual({ maxWidth: 1280 });
      expect(config.media.xl).toEqual({ maxWidth: 1420 });
    });

    it('should have greater-than breakpoints', () => {
      expect(config.media.gtXs).toEqual({ minWidth: 661 });
      expect(config.media.gtSm).toEqual({ minWidth: 801 });
      expect(config.media.gtMd).toEqual({ minWidth: 1021 });
    });
  });

  describe('Shorthands', () => {
    it('should have padding shorthands', () => {
      expect(config.shorthands.px).toBe('paddingHorizontal');
      expect(config.shorthands.py).toBe('paddingVertical');
    });

    it('should have margin shorthands', () => {
      expect(config.shorthands.mx).toBe('marginHorizontal');
      expect(config.shorthands.my).toBe('marginVertical');
    });

    it('should have flex shorthands', () => {
      expect(config.shorthands.f).toBe('flex');
      expect(config.shorthands.ai).toBe('alignItems');
      expect(config.shorthands.jc).toBe('justifyContent');
      expect(config.shorthands.fd).toBe('flexDirection');
    });

    it('should have dimension shorthands', () => {
      expect(config.shorthands.w).toBe('width');
      expect(config.shorthands.h).toBe('height');
    });
  });

  describe('Animations', () => {
    it('should have animation presets', () => {
      expect(config.animations).toBeDefined();
    });
  });

  describe('Fonts', () => {
    it('should have font configurations', () => {
      expect(config.fonts).toBeDefined();
      expect(config.fonts.heading).toBeDefined();
      expect(config.fonts.body).toBeDefined();
      expect(config.fonts.mono).toBeDefined();
    });
  });
});
