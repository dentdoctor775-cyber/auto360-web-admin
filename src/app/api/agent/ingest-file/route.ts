import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { lookupDeviceByKey, touchDevice } from "@/lib/agent/device";
import crypto from "crypto";

export const runtime = "nodejs";

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const device_key = String(form.get("device_key") ?? "");
  const source_type = String(form.get("source_type") ?? "UNKNOWN");
  const file_path = String(form.get("file_path") ?? "");
  const modified_at = String(form.get("file_modified_at") ?? "");
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (!device_key) {
    return NextResponse.json({ ok: false, error: "Missing device_key" }, { status: 400 });
  }

  const device = await lookupDeviceByKey(device_key);
  if (!device) return NextResponse.json({ ok: false, error: "Unknown device_key" }, { status: 401 });

  await touchDevice(device.id);

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = sha256(buffer);

  const admin = createSupabaseAdminClient();

  // Upload to Storage bucket "intake" (create it in Supabase Storage)
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const safeName = String(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${device.store_id}/${device.id}/${y}-${m}-${d}/${hash}_${safeName}`;

  const { error: upErr } = await admin.storage
    .from("intake")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  // If already exists, ignore (dedupe by hash+name)
  if (upErr && !String(upErr.message).toLowerCase().includes("already exists")) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  const { error: insErr } = await admin.from("intake_files").insert({
    store_id: device.store_id,
    device_id: device.id,
    source_type,
    file_name: file.name,
    file_path,
    file_hash: hash,
    file_modified_at: modified_at ? new Date(modified_at).toISOString() : null,
    status: "NEW",
  });

  if (insErr) {
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, storagePath, hash });
}
