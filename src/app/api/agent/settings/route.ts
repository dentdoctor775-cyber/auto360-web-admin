import { NextResponse } from "next/server";
import { lookupDeviceByKey, touchDevice } from "@/lib/agent/device";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const device_key = url.searchParams.get("device_key") ?? "";

  if (!device_key) {
    return NextResponse.json({ ok: false, error: "Missing device_key" }, { status: 400 });
  }

  const device = await lookupDeviceByKey(device_key);
  if (!device) return NextResponse.json({ ok: false, error: "Unknown device_key" }, { status: 401 });

  await touchDevice(device.id);

  const admin = createSupabaseAdminClient();
  const { data: settings } = await admin
    .from("settings_store")
    .select("*")
    .eq("store_id", device.store_id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    store_id: device.store_id,
    device_id: device.id,
    settings: settings ?? null,
  });
}
