import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    appName: "EV Co-Ownership Platform",
    contactEmail: "support@example.com",
    supportPhone: "+84 123 456 789",
  });

  const tabs = [
    { id: "general", label: "General" },
    { id: "payment", label: "Payment" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "features", label: "Features" },
    { id: "advanced", label: "Advanced" },
  ];

  const handleSave = () => {
    // Save settings
    alert("Settings saved");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-800">System Settings</h1>

      <div className="flex gap-2 border-b border-neutral-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id
                ? "text-accent-blue border-b-2 border-accent-blue"
                : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        {activeTab === "general" && (
          <div className="space-y-4">
            <Input
              label="App Name"
              value={settings.appName}
              onChange={(e) =>
                setSettings({ ...settings, appName: e.target.value })
              }
            />
            <Input
              label="Contact Email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
            />
            <Input
              label="Support Phone"
              value={settings.supportPhone}
              onChange={(e) =>
                setSettings({ ...settings, supportPhone: e.target.value })
              }
            />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-4">
            <p className="text-neutral-600">Payment settings</p>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <p className="text-neutral-600">Notification settings</p>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4">
            <p className="text-neutral-600">Security settings</p>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-4">
            <p className="text-neutral-600">Feature flags</p>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-4">
            <p className="text-neutral-600">Advanced settings</p>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-6 border-t border-neutral-200">
          <Button variant="accent" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings;
