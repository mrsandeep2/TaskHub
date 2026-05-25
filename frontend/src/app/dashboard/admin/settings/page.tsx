"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskSubmitted: true,
    taskAccepted: true,
    revisionRequested: true,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Monitor className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === value
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Bell className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Email Notifications</h3>
            <p className="text-xs text-muted-foreground">Control when you receive emails</p>
          </div>
        </div>
        <div className="space-y-4">
          {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [key]: !val }))}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                  val ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    val ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center">
            <Shield className="h-4 w-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Account</h3>
            <p className="text-xs text-muted-foreground">Manage your account settings</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
