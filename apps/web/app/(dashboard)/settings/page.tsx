'use client';

import { useState } from 'react';
import {
  User,
  Bell,
  Clock,
  Dumbbell,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAppState, useTheme } from '../../providers';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sections: SettingsSection[] = [
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'preferences', title: 'Preferences', icon: Clock },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'data', title: 'Data & Privacy', icon: Shield },
];

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const appState = useAppState();
  const { theme, toggleTheme } = useTheme();

  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Form states
  const [name, setName] = useState(appState.user?.name || '');
  const [email, setEmail] = useState(appState.user?.email || '');
  const [sessionDuration, setSessionDuration] = useState(
    appState.preferences.sessionDuration
  );
  const [reminderTime, setReminderTime] = useState(
    appState.preferences.reminderTime
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name,
        email,
      },
      preferences: {
        sessionDuration,
        reminderTime,
        darkMode: theme === 'dark',
      },
      bodyRegions: appState.bodyRegions,
      sessions: appState.sessions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted">
            Manage your account and preferences.
          </p>
        </div>
        {savedMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-white'
                      : 'text-muted hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="rounded-xl border border-border bg-card p-6 card-shadow">
              <h2 className="text-lg font-semibold text-foreground">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-muted">
                Update your personal information.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <>
              <div className="rounded-xl border border-border bg-card p-6 card-shadow">
                <h2 className="text-lg font-semibold text-foreground">
                  Recovery Preferences
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Customize your recovery experience.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Preferred Session Duration
                    </label>
                    <select
                      value={sessionDuration}
                      onChange={(e) =>
                        setSessionDuration(parseInt(e.target.value))
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-primary"
                    >
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Daily Reminder Time
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 card-shadow">
                <h2 className="text-lg font-semibold text-foreground">
                  Appearance
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Customize how the app looks.
                </p>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="h-5 w-5 text-muted" />
                      ) : (
                        <Sun className="h-5 w-5 text-muted" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">Dark Mode</p>
                        <p className="text-sm text-muted">
                          Use dark theme for the interface
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={theme === 'dark'}
                      onToggle={toggleTheme}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="rounded-xl border border-border bg-card p-6 card-shadow">
              <h2 className="text-lg font-semibold text-foreground">
                Notification Settings
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choose how you want to receive notifications.
              </p>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-sm text-muted">
                      Receive session reminders via email
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={emailNotifications}
                    onToggle={() => setEmailNotifications(!emailNotifications)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Push Notifications
                    </p>
                    <p className="text-sm text-muted">
                      Receive push notifications on your devices
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={pushNotifications}
                    onToggle={() => setPushNotifications(!pushNotifications)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Report</p>
                    <p className="text-sm text-muted">
                      Get a weekly summary of your progress
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={weeklyReport}
                    onToggle={() => setWeeklyReport(!weeklyReport)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Data & Privacy Section */}
          {activeSection === 'data' && (
            <>
              <div className="rounded-xl border border-border bg-card p-6 card-shadow">
                <h2 className="text-lg font-semibold text-foreground">
                  Export Your Data
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Download all your data in JSON format.
                </p>

                <button
                  onClick={handleExportData}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export All Data
                </button>
              </div>

              <div className="rounded-xl border border-error/50 bg-error/5 p-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Danger Zone
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Permanently delete your account and all associated data.
                </p>

                <button className="mt-4 flex items-center gap-2 rounded-lg bg-error px-6 py-2.5 text-sm font-medium text-white hover:bg-error/90 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </>
          )}

          {/* Disclaimer Section (Always Visible) */}
          <div className="rounded-xl border border-warning/50 bg-warning/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Important Disclaimer
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  This app provides guided self-care information for recovery
                  and mobility purposes. It is not intended to be a substitute
                  for professional medical advice, diagnosis, or treatment.
                  Always seek the advice of your physician or other qualified
                  health provider with any questions you may have regarding a
                  medical condition.
                </p>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Never disregard professional medical advice or delay in
                  seeking it because of something you have read or experienced
                  through this app. If you think you may have a medical
                  emergency, call your doctor or emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
