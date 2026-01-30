"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Card, Input, Label } from "@/components/ui";

type SettingsRow = {
  store_id: string;
  ccc_home_path: string | null;
  ccc_production_path: string | null;
  ccc_parts_status_path: string | null;
  bms_ems_path: string | null;
  inbox_path: string | null;
  dymo_printer_name: string | null;
};

export default function SettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [form, setForm] = useState<SettingsRow | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    async function load() {
      const membership = await supabase
        .from("store_users")
        .select("stores(id,name)")
        .limit(1)
        .single();

      const sid = membership.data?.stores?.id as string | undefined;
      setStoreId(sid ?? "");
      setStoreName((membership.data?.stores?.name as string) ?? "");

      if (!sid) return;

      const settings = await supabase
        .from("settings_store")
        .select("*")
        .eq("store_id", sid)
        .maybeSingle();

      setForm(
        (settings.data as SettingsRow) ?? {
          store_id: sid,
          ccc_home_path: null,
          ccc_production_path: null,
          ccc_parts_status_path: null,
          bms_ems_path: null,
          inbox_path: null,
          dymo_printer_name: null,
        }
      );
    }
    load();
  }, [supabase]);

  async function save() {
    if (!form) return;
    setStatus("Saving...");
    const { error } = await supabase
      .from("settings_store")
      .upsert(form, { onConflict: "store_id" });

    setStatus(error ? `Error: ${error.message}` : "Saved ✅");
  }

  function setField<K extends keyof SettingsRow>(key: K, value: SettingsRow[K]) {
    if (!form) return;
    setForm({ ...form, [key]: value });
  }

  if (!form) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Setup Wizard</div>
        <div className="text-sm text-gray-600">
          Store: <span className="font-medium">{storeName}</span>
        </div>
      </div>

      <Card
        title="Folder Intake Paths"
        right={<Button onClick={save}>Save</Button>}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>CCC Home Path</Label>
            <Input
              value={form.ccc_home_path ?? ""}
              onChange={(e) => setField("ccc_home_path", e.target.value)}
              placeholder="C:\AUTO360\CCC\Home"
            />
          </div>

          <div className="space-y-2">
            <Label>CCC Production Path</Label>
            <Input
              value={form.ccc_production_path ?? ""}
              onChange={(e) => setField("ccc_production_path", e.target.value)}
              placeholder="C:\AUTO360\CCC\Production"
            />
          </div>

          <div className="space-y-2">
            <Label>CCC Parts Status Path</Label>
            <Input
              value={form.ccc_parts_status_path ?? ""}
              onChange={(e) =>
                setField("ccc_parts_status_path", e.target.value)
              }
              placeholder="C:\AUTO360\CCC\PartsStatus"
            />
          </div>

          <div className="space-y-2">
            <Label>BMS / EMS Path</Label>
            <Input
              value={form.bms_ems_path ?? ""}
              onChange={(e) => setField("bms_ems_path", e.target.value)}
              placeholder="C:\AUTO360\EMS"
            />
          </div>

          <div className="space-y-2">
            <Label>INBOX Path</Label>
            <Input
              value={form.inbox_path ?? ""}
              onChange={(e) => setField("inbox_path", e.target.value)}
              placeholder="C:\AUTO360\INBOX"
            />
          </div>
        </div>
      </Card>

      <Card title="Printer Settings" right={<Button onClick={save}>Save</Button>}>
        <div className="space-y-2 max-w-xl">
          <Label>DYMO Printer Name (Windows)</Label>
          <Input
            value={form.dymo_printer_name ?? ""}
            onChange={(e) => setField("dymo_printer_name", e.target.value)}
            placeholder="DYMO LabelWriter 450"
          />
          <div className="text-xs text-gray-500">
            The Agent will use this later for local printing.
          </div>
        </div>
      </Card>

      {status && <div className="text-sm text-gray-700">{status}</div>}
    </div>
  );
}
