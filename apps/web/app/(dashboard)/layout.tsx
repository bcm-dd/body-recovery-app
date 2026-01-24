import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main content area - responsive padding for sidebar */}
      <div className="md:pl-64">
        {/* Header with breadcrumbs - adjusted for mobile header */}
        <header className="sticky top-14 md:top-0 z-30 h-12 md:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center px-4 sm:px-6 md:px-8">
            <Breadcrumbs />
          </div>
        </header>

        {/* Page content - responsive padding and mobile bottom nav spacing */}
        <main className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pb-20 md:pb-8">
          {children}
        </main>

        {/* Footer - responsive and hidden on small mobile to save space */}
        <footer className="border-t border-border px-4 py-4 sm:px-6 md:px-8 md:py-6 mb-16 md:mb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted">
            <p className="text-center sm:text-left">Body Recovery Companion - Your movement and recovery partner</p>
            <p className="max-w-md text-center sm:text-right text-xs">
              This app provides guided self-care information and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
