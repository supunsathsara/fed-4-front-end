import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Lock, Database } from "lucide-react";

export function SettingsTab() {
  const [settings, setSettings] = useState({
    appName: "Aelora Admin",
    maintenanceMode: false,
    emailNotifications: true,
    logRetention: "30",
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure admin panel and system-wide settings
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-foreground">
            General Settings
          </h3>
        </div>
        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Application Name
            </label>
            <Input
              value={settings.appName}
              onChange={(e) => handleChange("appName", e.target.value)}
              placeholder="Enter application name"
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div>
              <p className="font-medium text-foreground">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Disable access for regular users
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                handleChange("maintenanceMode", e.target.checked)
              }
              className="w-5 h-5"
            />
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Notifications
          </h3>
        </div>
        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for system events
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                handleChange("emailNotifications", e.target.checked)
              }
              className="w-5 h-5"
            />
          </div>
        </div>
      </Card>

      {/* Data Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-foreground">Data</h3>
        </div>
        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Log Retention (days)
            </label>
            <Input
              type="number"
              value={settings.logRetention}
              onChange={(e) => handleChange("logRetention", e.target.value)}
              placeholder="Enter days"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Logs older than this duration will be automatically deleted
            </p>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-foreground">Security</h3>
        </div>
        <Separator className="my-4" />

        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Reset Admin Passwords
          </Button>
          <Button variant="outline" className="w-full">
            View Audit Logs
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
