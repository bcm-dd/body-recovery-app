import { SkipLink, AnnouncerProvider, LiveRegion } from '@/components/A11y';
import { AnalyticsProvider, AnalyticsErrorBoundary } from '@/components/AnalyticsProvider';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcuts';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalyticsProvider
      autoTrackPageViews={true}
      trackWebVitals={true}
      trackPerformance={true}
    >
      <AnnouncerProvider>
        <KeyboardShortcutsProvider>
          <AnalyticsErrorBoundary>
            <div className="min-h-screen bg-background relative">
              {/* Skip Link for Keyboard Navigation */}
              <SkipLink href="#main-content">Skip to main content</SkipLink>

              {/* Gradient Mesh Background - decorative, hidden from screen readers */}
              <div className="gradient-mesh" aria-hidden="true" />

              {/* Navigation Sidebar */}
              <Sidebar />

              {/* Main content area - responsive padding for sidebar */}
              <div className="md:pl-64 relative z-10">
                {/* Header with breadcrumbs - Glass Effect */}
                <header
                  className="sticky top-14 md:top-0 z-30 h-12 md:h-16 glass-header"
                  role="banner"
                >
                  <div className="flex h-full items-center px-4 sm:px-6 md:px-8">
                    <Breadcrumbs />
                  </div>
                </header>

                {/* Page content - responsive padding and mobile bottom nav spacing */}
                <main
                  id="main-content"
                  className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pb-20 md:pb-8"
                  role="main"
                  tabIndex={-1}
                >
                  <div className="fade-in-up">
                    {children}
                  </div>
                </main>

                {/* Footer - Glass Effect */}
                <footer
                  className="glass-footer px-4 py-4 sm:px-6 md:px-8 md:py-6 mb-16 md:mb-0"
                  role="contentinfo"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--text-muted)]">
                    <p className="text-center sm:text-left">
                      Body Recovery Companion - Your movement and recovery partner
                    </p>
                    <p className="max-w-md text-center sm:text-right text-xs">
                      <strong>Disclaimer:</strong> This app provides guided self-care
                      information and is not a substitute for professional medical
                      advice, diagnosis, or treatment.
                    </p>
                  </div>
                </footer>
              </div>

              {/* Live Region for Dynamic Announcements */}
              <LiveRegion aria-live="polite" role="status" />
            </div>
          </AnalyticsErrorBoundary>
        </KeyboardShortcutsProvider>
      </AnnouncerProvider>
    </AnalyticsProvider>
  );
}
