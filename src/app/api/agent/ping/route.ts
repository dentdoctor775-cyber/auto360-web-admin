import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupDeviceByKey, touchDevice } from "@/lib/agent/device";

export const runtime = "nodejs";

const Body = z.object({
  device_key: z.string().min(10),
  device_name: z.string().min(1).optional(),
  version: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { device_key, device_name } = parsed.data;
  const device = await lookupDeviceByKey(device_key);

  if (!device) {
    return NextResponse.json({ ok: false, error: "Unknown device_key" }, { status: 401 });
  }

  await touchDevice(device.id, device_name);

  return NextResponse.json({
    ok: true,
    device_id: device.id,
    store_id: device.store_id,
  });
}
