"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Plug, Save } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function SettingsForm() {
  const { settings, loading, testing, fetchSettings, saveSettings, testConnection } = useSettings();
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const endpointRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { setEndpoint(settings.apiEndpoint); setApiKey(settings.apiKey); }, [settings]);

  // Remove readonly after mount so autofill never fires
  useEffect(() => {
    const timer = setTimeout(() => {
      endpointRef.current?.removeAttribute("readonly");
      keyRef.current?.removeAttribute("readonly");
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => { await saveSettings(endpoint, apiKey); };
  const handleTest = async () => { await saveSettings(endpoint, apiKey); await testConnection(); };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Connection</CardTitle>
        <CardDescription>Connect to any OpenAI-compatible API endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>API Endpoint URL</Label>
            <input
              ref={endpointRef}
              readOnly
              onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
              className={inputClass}
              placeholder="https://api.example.com/v1"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">The base URL for the OpenAI-compatible API</p>
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <input
                ref={keyRef}
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                className={inputClass}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={!showKey ? { WebkitTextSecurity: "disc" } as React.CSSProperties : undefined}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={handleSave} disabled={loading} variant="secondary">
              {loading ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
            <Button type="button" onClick={handleTest} disabled={testing || !endpoint}>
              {testing ? <Loader2 className="animate-spin" /> : <Plug className="h-4 w-4" />}
              Test & Fetch Models
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
