import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Tabs, Tab, Box } from "@mui/material";
import { useAppSelector } from "@/store/hooks";
import { isSystemAdmin } from "@/utils/roles";
import Unauthorized from "@/components/auth/Unauthorized";

const SystemSettings = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // Role check - SystemAdmin only
  if (!isSystemAdmin(user)) {
    return <Unauthorized requiredRole="SystemAdmin" />;
  }
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

      <Box sx={{ borderBottom: 1, borderColor: "var(--neutral-200)" }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              color: "var(--neutral-600)",
              fontWeight: 500,
              "&.Mui-selected": {
                color: "var(--accent-blue)",
              },
            },
            "& .MuiTabs-indicator": {
              bgcolor: "var(--accent-blue)",
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} label={tab.label} value={tab.id} />
          ))}
        </Tabs>
      </Box>

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
