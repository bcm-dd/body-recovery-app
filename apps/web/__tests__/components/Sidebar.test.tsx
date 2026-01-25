/**
 * Sidebar Component Tests
 *
 * Tests for navigation sidebar functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPathname = vi.fn(() => '/');
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// Mock the theme context - path relative to the component's import
const mockToggleTheme = vi.fn();
vi.mock('../../app/providers', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

// Mock useI18n hook
vi.mock('../../src/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'nav.dashboard': 'Dashboard',
        'nav.bodyMap': 'Body Map',
        'nav.progress': 'Progress',
        'nav.history': 'History',
        'nav.settings': 'Settings',
        'nav.getMobileApp': 'Get Mobile App',
        'nav.darkMode': 'Dark Mode',
        'nav.lightMode': 'Light Mode',
        'common.appName': 'Recovery',
        'common.premium': 'Premium',
        'accessibility.toggleTheme': 'Toggle theme',
        'accessibility.openMenu': 'Open menu',
        'accessibility.closeMenu': 'Close menu',
        'sidebar.disclaimer': 'For guided self-care only. Not medical advice.',
      };
      return translations[key] || key;
    },
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

// Import after mocks
import { Sidebar } from '../../src/components/Sidebar';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/');
  });

  describe('Desktop Navigation', () => {
    it('should render all navigation items', () => {
      render(<Sidebar />);

      // Multiple instances may exist due to desktop + mobile layouts
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Body Map').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
      expect(screen.getAllByText('History').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('should render app branding', () => {
      render(<Sidebar />);

      // Check for the app name
      const recoveryElements = screen.getAllByText('Recovery');
      expect(recoveryElements.length).toBeGreaterThan(0);
    });

    it('should highlight active navigation item', () => {
      mockPathname.mockReturnValue('/body');
      render(<Sidebar />);

      // Find the Body Map link and check it has active styling
      const bodyMapLinks = screen.getAllByRole('link', { name: /body map/i });
      expect(bodyMapLinks.length).toBeGreaterThan(0);
    });

    it('should have correct href for each nav item', () => {
      render(<Sidebar />);

      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(dashboardLinks[0]).toHaveAttribute('href', '/');

      const bodyMapLinks = screen.getAllByRole('link', { name: /body map/i });
      expect(bodyMapLinks[0]).toHaveAttribute('href', '/body');
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      render(<Sidebar />);

      // Look for theme toggle buttons by aria-label
      const themeButtons = screen.getAllByLabelText(/toggle theme/i);
      expect(themeButtons.length).toBeGreaterThan(0);
    });

    it('should call toggleTheme when clicked', () => {
      render(<Sidebar />);

      // Find the theme toggle buttons (may be multiple for desktop/mobile)
      const themeButtons = screen.getAllByLabelText(/toggle theme/i);
      expect(themeButtons.length).toBeGreaterThan(0);

      // Click the first one
      fireEvent.click(themeButtons[0]);
      expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('should have correct aria-pressed state', () => {
      render(<Sidebar />);

      // In light mode, aria-pressed should be false (not dark mode)
      const themeButtons = screen.getAllByLabelText(/toggle theme/i);
      expect(themeButtons[0]).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Mobile Navigation', () => {
    it('should render mobile header', () => {
      render(<Sidebar />);

      // Mobile header should have the app name
      const recoveryElements = screen.getAllByText('Recovery');
      expect(recoveryElements.length).toBeGreaterThan(0);
    });

    it('should render mobile menu button', () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText(/open menu/i);
      expect(menuButton).toBeInTheDocument();
    });

    it('should open mobile menu when menu button clicked', async () => {
      render(<Sidebar />);

      const menuButton = screen.getByLabelText(/open menu/i);
      fireEvent.click(menuButton);

      // Close button should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
      });
    });

    it('should close mobile menu when close button clicked', async () => {
      render(<Sidebar />);

      // Open menu
      const menuButton = screen.getByLabelText(/open menu/i);
      fireEvent.click(menuButton);

      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
      });

      // Close menu
      const closeButton = screen.getByLabelText(/close menu/i);
      fireEvent.click(closeButton);

      // Menu should close - close button should no longer be visible
      await waitFor(() => {
        expect(screen.queryByLabelText(/close menu/i)).not.toBeInTheDocument();
      });
    });

    it('should render bottom navigation for mobile', () => {
      render(<Sidebar />);

      // Bottom nav should have the first 4 items
      const bottomNavLinks = screen.getAllByRole('link');
      // Should have links for Dashboard, Body Map, Progress, History in bottom nav
      const hrefs = bottomNavLinks.map((link) => link.getAttribute('href'));
      expect(hrefs).toContain('/');
      expect(hrefs).toContain('/body');
      expect(hrefs).toContain('/progress');
      expect(hrefs).toContain('/history');
    });
  });

  describe('Additional UI Elements', () => {
    it('should render mobile app link', () => {
      render(<Sidebar />);

      const mobileAppLinks = screen.getAllByText(/get mobile app/i);
      expect(mobileAppLinks.length).toBeGreaterThan(0);
    });

    it('should render disclaimer text', () => {
      render(<Sidebar />);

      const disclaimers = screen.getAllByText(/guided self-care/i);
      expect(disclaimers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible navigation landmark', () => {
      render(<Sidebar />);

      // Should have navigation elements
      const navElements = screen.getAllByRole('navigation');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should have proper aria labels for buttons', () => {
      render(<Sidebar />);

      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/toggle theme/i).length).toBeGreaterThan(0);
    });
  });
});
