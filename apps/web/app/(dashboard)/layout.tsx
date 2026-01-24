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

      {/* Main content area */}
      <div className="pl-64">
        {/* Header with breadcrumbs */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center px-8">
            <Breadcrumbs />
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border px-8 py-6">
          <div className="flex items-center justify-between text-sm text-muted">
            <p>Body Recovery Companion - Your movement and recovery partner</p>
            <p className="max-w-md text-right text-xs">
              This app provides guided self-care information and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
