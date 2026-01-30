"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Card, Input, Label } from "@/components/ui";

type DeviceRow = {
  id: string;
  device_name: string;
  device_key: string;
  last_seen_at: string | null;
  created_at: string;
};

export default function DevicesPage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [deviceName, setDeviceName] = useState("SHOP-PC-1");
  const [status, setStatus] = useState("");

  async function load() {
    const membership = await supabase
      .from("store_users")
      .select("stores(id)")
      .limit(1)
      .single();

    const sid = (membership.data?.stores?.id as string) ?? "";
    setStoreId(sid);

    if (!sid) return;

    const { data } = await supabase
      .from("devices")
      .select("id, device_name, device_key, last_seen_at, created_at")
      .eq("store_id", sid)
      .order("created_at", { ascending: false });

    setDevices((data as DeviceRow[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createDevice() {
    if (!storeId) return;
    setStatus("Creating...");
    const key = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase.from("devices").insert({
      store_id: storeId,
      device_name: deviceName,
      device_key: key,
    });

    setStatus(error ? `Error: ${error.message}` : "Created ✅");
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Devices</div>
        <div className="text-sm text-gray-600">
          Create a <span className="font-medium">device key</span> for each shop PC running the Agent.
        </div>
      </div>

      <Card title="Create Device" right={<Button onClick={createDevice}>Create</Button>}>
        <div className="max-w-xl space-y-2">
          <Label>Device Name</Label>
          <Input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
          {status && <div className="text-sm text-gray-700 mt-2">{status}</div>}
          <div className="text-xs text-gray-500 mt-2">
            After creating, copy the device_key into <code>agent/agent.config.json</code>.
          </div>
        </div>
      </Card>

      <Card title="Registered Devices">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Device</th>
                <th className="py-2 pr-4">Last Seen</th>
                <th className="py-2 pr-4">Device Key</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{d.device_name}</td>
                  <td className="py-2 pr-4">{d.last_seen_at ?? "-"}</td>
                  <td className="py-2 pr-4">
                    <code className="text-xs">{d.device_key}</code>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={3}>
                    No devices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
