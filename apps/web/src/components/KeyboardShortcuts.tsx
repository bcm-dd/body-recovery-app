'use client';

import { useEffect, useState, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  User,
  TrendingUp,
  Settings,
  HelpCircle,
  X,
  Keyboard,
  Search,
} from 'lucide-react';
import { useKeyboardShortcuts } from './A11y';

interface KeyboardShortcutsProps {
  showHelp?: boolean;
}

// Keyboard shortcut definitions
const shortcuts = [
  { key: 'g h', label: 'Go to Dashboard', category: 'Navigation' },
  { key: 'g b', label: 'Go to Body Map', category: 'Navigation' },
  { key: 'g p', label: 'Go to Progress', category: 'Navigation' },
  { key: 'g s', label: 'Go to Settings', category: 'Navigation' },
  { key: '/', label: 'Focus search', category: 'General' },
  { key: '?', label: 'Show keyboard shortcuts', category: 'General' },
  { key: 'Esc', label: 'Close dialog / Cancel', category: 'General' },
];

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const dialogTitleId = useId();

  // Handle "g" prefix navigation shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    // Handle pending "g" prefix
    if (pendingKey === 'g') {
      event.preventDefault();
      setPendingKey(null);

      switch (key) {
        case 'h':
          router.push('/');
          break;
        case 'b':
          router.push('/body');
          break;
        case 'p':
          router.push('/progress');
          break;
        case 's':
          router.push('/settings');
          break;
      }
      return;
    }

    // Handle initial key presses
    switch (key) {
      case 'g':
        event.preventDefault();
        setPendingKey('g');
        // Clear pending key after timeout
        setTimeout(() => setPendingKey(null), 1500);
        break;
      case '?':
        if (event.shiftKey) {
          event.preventDefault();
          setShowShortcutsDialog(true);
        }
        break;
      case '/':
        // Focus search if it exists
        event.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
        break;
      case 'escape':
        setShowShortcutsDialog(false);
        setPendingKey(null);
        break;
    }
  }, [pendingKey, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Handle escape key for dialog
  useEffect(() => {
    if (!showShortcutsDialog) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowShortcutsDialog(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showShortcutsDialog]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (showShortcutsDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showShortcutsDialog]);

  return (
    <>
      {children}

      {/* Pending key indicator */}
      {pendingKey && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-4 py-2 rounded-xl flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <Keyboard className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm text-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono">{pendingKey}</kbd> +
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono ml-1">h</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono ml-1">b</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono ml-1">p</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs font-mono ml-1">s</kbd>
          </span>
        </div>
      )}

      {/* Keyboard shortcuts dialog */}
      {showShortcutsDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowShortcutsDialog(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-lg glass-panel-strong rounded-2xl shadow-2xl animate-popIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h2 id={dialogTitleId} className="text-lg font-semibold text-foreground">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowShortcutsDialog(false)}
                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close keyboard shortcuts"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Navigation shortcuts */}
              <section className="mb-6">
                <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
                  Navigation
                </h3>
                <ul className="space-y-2" role="list">
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Go to Dashboard</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">g h</kbd>
                  </li>
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Go to Body Map</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">g b</kbd>
                  </li>
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Go to Progress</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">g p</kbd>
                  </li>
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Go to Settings</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">g s</kbd>
                  </li>
                </ul>
              </section>

              {/* General shortcuts */}
              <section>
                <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
                  General
                </h3>
                <ul className="space-y-2" role="list">
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Focus search</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">/</kbd>
                  </li>
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Show keyboard shortcuts</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">?</kbd>
                  </li>
                  <li className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface">
                    <div className="flex items-center gap-3">
                      <X className="h-4 w-4 text-muted" aria-hidden="true" />
                      <span className="text-sm text-foreground">Close dialog / Cancel</span>
                    </div>
                    <kbd className="px-2 py-1 rounded bg-surface border border-border text-xs font-mono">Esc</kbd>
                  </li>
                </ul>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-surface border border-border text-xs font-mono">?</kbd> anywhere to show this dialog
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Keyboard shortcut button to open dialog
export function KeyboardShortcutsButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={`p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      aria-label="Show keyboard shortcuts (press ? to open)"
      title="Keyboard shortcuts (?)"
    >
      <Keyboard className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default KeyboardShortcutsProvider;
