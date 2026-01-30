import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DeviceLookup = {
  id: string;
  store_id: string;
  device_name: string;
  device_key: string;
};

export async function lookupDeviceByKey(device_key: string): Promise<DeviceLookup | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("devices")
    .select("id, store_id, device_name, device_key")
    .eq("device_key", device_key)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as DeviceLookup;
}

export async function touchDevice(device_id: string, device_name?: string) {
  const admin = createSupabaseAdminClient();
  await admin
    .from("devices")
    .update({
      last_seen_at: new Date().toISOString(),
      ...(device_name ? { device_name } : {}),
    })
    .eq("id", device_id);
}
