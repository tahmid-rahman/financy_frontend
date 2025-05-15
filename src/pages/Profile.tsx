import { useState } from "react";
// import Button from "../components/ui/Button";
import { Tabs } from "../components/ui/Tabs";
import ProfileSection from "../components/profile/ProfileSection";
import SettingsSection from "../components/profile/SettingsSection";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Profile | Financy</title>
      </Helmet>
      {/* Header */}
      <Navbar />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Tabs
          tabs={[
            { id: "profile", label: "Profile" },
            { id: "settings", label: "Settings" },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            if (tabId === "profile" || tabId === "settings") {
              setActiveTab(tabId);
            }
          }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === "profile" ? <ProfileSection /> : <SettingsSection />}
      </main>
    </div>
  );
}
