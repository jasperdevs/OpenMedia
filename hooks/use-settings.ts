import { useState, useCallback } from "react";
import { toast } from "./use-toast";

interface SettingsData {
  apiEndpoint: string;
  apiKey: string;
  hasKey: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    apiEndpoint: "",
    apiKey: "",
    hasKey: false,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    }
  }, []);

  const saveSettings = useCallback(
    async (endpoint: string, key: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiEndpoint: endpoint, apiKey: key }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast({ title: "Settings saved" });
        await fetchSettings();
      } catch {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    },
    [fetchSettings]
  );

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/settings/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const desc = `${data.totalFetched} models fetched. ${data.mediaModelCount} media, ${data.unclassifiedCount} unclassified.`;
        toast({ title: "Connected", description: desc });
        return data;
      } else {
        toast({ title: "Connection failed", description: data.error, variant: "destructive" });
        return null;
      }
    } catch {
      toast({ title: "Error", description: "Connection test failed", variant: "destructive" });
      return null;
    } finally {
      setTesting(false);
    }
  }, []);

  return { settings, loading, testing, fetchSettings, saveSettings, testConnection };
}
