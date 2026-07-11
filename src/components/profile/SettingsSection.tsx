import { Switch } from "@headlessui/react";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("English");
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedNotifications = localStorage.getItem("notifications");
    const savedCurrency = localStorage.getItem("currency");
    const savedLanguage = localStorage.getItem("language");

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
    if (savedNotifications !== null) setNotifications(savedNotifications !== "false");
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const handleSave = () => {
    setIsSaving(true);
    // Settings are already saved to localStorage via useEffect
    setTimeout(() => {
      setIsSaving(false);
      showToast({ message: "Settings saved successfully!", type: "success" });
    }, 500);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem("currency", value);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
  };

  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem("notifications", String(value));
  };

  return (
    <div className="bg-surface border border-border/50 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">Application Settings</h2>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Appearance</h3>
            <p className="text-sm text-text-muted">Customize how the app looks</p>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              className={`${darkMode ? "bg-primary" : "bg-border"}
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${darkMode ? "translate-x-6" : "translate-x-1"}
                  inline-block h-4 w-4 transform rounded-full bg-surface transition-transform`}
              />
            </Switch>
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-text-muted">Enable or disable notifications</p>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={notifications}
              onChange={handleNotificationsChange}
              className={`${notifications ? "bg-primary" : "bg-border"}
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${notifications ? "translate-x-6" : "translate-x-1"}
                  inline-block h-4 w-4 transform rounded-full bg-surface transition-transform`}
              />
            </Switch>
            <span>{notifications ? "Enabled" : "Disabled"}</span>
          </div>
        </div>

        {/* Currency */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Currency</h3>
            <p className="text-sm text-text-muted">Set your preferred currency</p>
          </div>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none sm:w-40"
          >
            <option value="BDT">BDT (৳)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Language</h3>
            <p className="text-sm text-text-muted">Set your preferred language</p>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none sm:w-40"
          >
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>

        {/* Data Management */}
        <div className="pt-6 border-t border-border/50">
          <h3 className="font-medium mb-4">Data Management</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Export Data (CSV)</Button>
            <Button variant="secondary">Export Data (PDF)</Button>
            <Button variant="secondary">Import Data</Button>
            <Button variant="ghost" className="text-accent">
              Delete Account
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-border/50">
          <Button onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}