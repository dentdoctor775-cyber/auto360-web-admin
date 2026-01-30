import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const FormSchema = z.object({
  store_id: z.string().uuid(),
});

function cleanPartNumber(input: unknown): string {
  const s = String(input ?? "").trim().toUpperCase();
  if (!s) return "";
  // remove separators like Excel formula
  return s
    .replace(/[-\s/\\]/g, "")
    .replace(/[.,]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

const CATEGORY_KEYWORDS: Array<[RegExp, string]> = [
  [/\bbumper\b/i, "Bumpers"],
  [/\b(headlamp|headlight|taillight|tail lamp|lamp|light)\b/i, "Lamps"],
  [/\b(glass|windshield|door glass|back glass)\b/i, "Glass"],
  [/\bclip\b|\bretainer\b/i, "Clips"],
  [/\bbracket\b/i, "Brackets"],
  [/\b(panel|fender|hood|door|quarter|decklid|tailgate|liftgate)\b/i, "Panels"],
  [/\b(seat|trim|interior|dash|console)\b/i, "Interior"],
  [/\b(wire|sensor|module|harness|relay|switch)\b/i, "Electrical"],
  [/\b(engine|radiator|condenser|compressor|mechanical|pump|transmission)\b/i, "Mechanical"],
];

function inferCategory(desc: string): string | null {
  const d = (desc ?? "").toLowerCase();
  if (!d) return null;
  for (const [rx, cat] of CATEGORY_KEYWORDS) {
    if (rx.test(d)) return cat;
  }
  return null;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[$,]/g, "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseRouteClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    const form = await req.formData();
    const store_id = String(form.get("store_id") ?? "");
    const parsed = FormSchema.safeParse({ store_id });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid store_id" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    // Authorization: must be ADMIN or SUPER_ADMIN in that store
    const { data: membership } = await supabase
      .from("store_users")
      .select("role")
      .eq("store_id", store_id)
      .limit(1)
      .maybeSingle();

    const role = membership?.role as string | undefined;
    if (!role || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });

    const errors: { row: number; message: string; part?: string }[] = [];
    const map = new Map<string, any>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNumber = i + 2; // + header row
      const raw = r["RAW Part Number"] ?? r["Raw Part Number"] ?? r["Raw"] ?? "";
      const providedClean = r["Part Number (CLEAN)"] ?? r["Part Number"] ?? r["Clean Part Number"] ?? "";
      const clean = cleanPartNumber(providedClean || raw);

      if (!clean) {
        errors.push({ row: rowNumber, message: "Missing Part Number (CLEAN) and RAW Part Number" });
        continue;
      }

      const desc = String(r["Part Description"] ?? r["Description"] ?? "").trim();
      const categoryProvided = String(r["Category"] ?? "").trim();
      const category = categoryProvided || inferCategory(desc);

      const year = toNumber(r["Year"]);
      const make = String(r["Make"] ?? "").trim() || null;
      const model = String(r["Model"] ?? "").trim() || null;

      const list_price = toNumber(r["List"] ?? r["List Price"] ?? r["Price"]);
      const cost = toNumber(r["Cost"]);

      const picture_file = String(r["Picture File"] ?? "").trim() || null;
      const alt_part_number = String(r["Alternative Part Number"] ?? "").trim() || null;

      map.set(clean, {
        store_id,
        part_number_raw: String(raw ?? "").trim() || null,
        part_number_clean: clean,
        description: desc || null,
        category: category || null,
        year_start: year ? Math.trunc(year) : null,
        year_end: year ? Math.trunc(year) : null,
        make,
        model,
        list_price,
        cost,
        picture_file,
        alt_part_number,
        updated_by: user.id,
        created_by: user.id,
      });
    }

    const dedupedWithinFile = rows.length - map.size;

    const payload = Array.from(map.values());

    const admin = createSupabaseAdminClient();

    // Upsert in batches to avoid payload limits
    const BATCH = 500;
    let upserted = 0;
    for (let i = 0; i < payload.length; i += BATCH) {
      const chunk = payload.slice(i, i + BATCH);
      const { error } = await admin
        .from("parts_master_catalog")
        .upsert(chunk, { onConflict: "store_id,part_number_clean" });

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message, summary: { rowsRead: rows.length, rowsUpserted: upserted, dedupedWithinFile, errors: errors.length }, errors },
          { status: 500 }
        );
      }
      upserted += chunk.length;
    }

    return NextResponse.json({
      ok: true,
      summary: {
        rowsRead: rows.length,
        dedupedWithinFile,
        rowsUpserted: upserted,
        errors: errors.length,
      },
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
