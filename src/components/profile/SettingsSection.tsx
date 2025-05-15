import { Switch } from "@headlessui/react";
import Button from "../ui/Button";
import { useState } from "react";

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");

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
              onChange={setNotifications}
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
            onChange={(e) => setCurrency(e.target.value)}
            className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none sm:w-40"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="BDT">BDT (৳)</option>
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
            onChange={(e) => setLanguage(e.target.value)}
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
          <Button className="w-full sm:w-auto">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
