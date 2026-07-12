import { Switch } from "@headlessui/react";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { getExpenses, getIncomes, getCategories, getIncomeSources } from "../../services/api";

const themes = [
  { id: "cyan", name: "Cyan", color: "bg-cyan-500" },
  { id: "blue", name: "Blue", color: "bg-blue-500" },
  { id: "green", name: "Green", color: "bg-green-500" },
  { id: "purple", name: "Purple", color: "bg-purple-500" },
  { id: "rose", name: "Rose", color: "bg-rose-500" },
];

export default function SettingsSection() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("English");
  const [currentTheme, setCurrentTheme] = useState("cyan");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  // Load settings from localStorage on mount - sync state with localStorage without reapplying
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedNotifications = localStorage.getItem("notifications");
    const savedCurrency = localStorage.getItem("currency");
    const savedLanguage = localStorage.getItem("language");
    const savedTheme = localStorage.getItem("theme") || "cyan";

    if (savedDarkMode !== null) setDarkMode(savedDarkMode === "true");
    if (savedNotifications !== null) setNotifications(savedNotifications !== "false");
    if (savedCurrency) setCurrency(savedCurrency);
    if (savedLanguage) setLanguage(savedLanguage);
    setCurrentTheme(savedTheme);

    // Listen for theme changes from other components (like ThemeToggle)
    const handleThemeChange = () => {
      const isDark = localStorage.getItem("darkMode") === "true";
      const theme = localStorage.getItem("theme") || "cyan";
      setDarkMode(isDark);
      setCurrentTheme(theme);
      // Apply to document
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, "")
        .trim();
      if (theme !== "cyan") {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

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

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem("theme", themeId);
    // Remove old theme class
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, "")
      .trim();
    // Add new theme class (only if not default cyan)
    if (themeId !== "cyan") {
      document.documentElement.classList.add(`theme-${themeId}`);
    }
    // Dispatch event for other components
    window.dispatchEvent(new Event("themechange"));
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const [expensesRes, incomesRes, categoriesRes, sourcesRes] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getCategories(),
        getIncomeSources(),
      ]);

      const expenses = expensesRes.data || [];
      const incomes = incomesRes.data || [];
      const categories: Record<number, string> = {};
      (categoriesRes.data || []).forEach((c: { id: number; name: string }) => {
        categories[c.id] = c.name;
      });
      const sources: Record<number, string> = {};
      (sourcesRes.data || []).forEach((s: { id: number; name: string }) => {
        sources[s.id] = s.name;
      });

      // Create expenses CSV
      const expenseHeaders = ["Date", "Category", "Description", "Amount"];
      const expenseRows = expenses.map((e: { date: string; category: number; description: string; amount: number }): string[] => [
        new Date(e.date).toLocaleDateString(),
        categories[e.category] || "Unknown",
        e.description || "-",
        e.amount.toString(),
      ]);

      // Create incomes CSV
      const incomeHeaders = ["Date", "Source", "Description", "Amount"];
      const incomeRows = incomes.map((i: { date: string; source: number; description: string; amount: number }): string[] => [
        new Date(i.date).toLocaleDateString(),
        sources[i.source] || "Unknown",
        i.description || "-",
        i.amount.toString(),
      ]);

      // Combine into one export
      const csvContent = [
        "=== EXPENSES ===",
        expenseHeaders.map(h => `"${h}"`).join(","),
        ...expenseRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
        "",
        "=== INCOME ===",
        incomeHeaders.map(h => `"${h}"`).join(","),
        ...incomeRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `financy-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      showToast({ message: "Data exported successfully!", type: "success" });
    } catch (err) {
      showToast({ message: "Failed to export data", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      showToast({ message: "Account deletion is not implemented yet. Contact support.", type: "info" });
    }
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

        {/* Theme */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Theme Color</h3>
            <p className="text-sm text-text-muted">Choose your accent color</p>
          </div>
          <div className="flex gap-2 items-center">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-8 h-8 rounded-full ${theme.color} ${
                  currentTheme === theme.id ? "ring-2 ring-offset-2 ring-primary" : ""
                } hover:scale-110 transition-transform`}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="pt-6 border-t border-border/50">
          <h3 className="font-medium mb-4">Data Management</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExportCSV} isLoading={isExporting}>
              Export Data (CSV)
            </Button>
            <Button variant="ghost" className="text-accent" onClick={handleDeleteAccount}>
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