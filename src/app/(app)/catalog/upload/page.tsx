"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Card, Input, Label } from "@/components/ui";

type UploadResult = {
  ok: boolean;
  summary?: {
    rowsRead: number;
    rowsUpserted: number;
    dedupedWithinFile: number;
    errors: number;
  };
  errors?: { row: number; message: string; part?: string }[];
};

export default function CatalogUploadPage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    supabase
      .from("store_users")
      .select("stores(id, name)")
      .limit(1)
      .single()
      .then(({ data }) => {
        setStoreId((data?.stores?.id as string) ?? "");
        setStoreName((data?.stores?.name as string) ?? "");
      });
  }, [supabase]);

  async function upload() {
    if (!file || !storeId) return;
    setBusy(true);
    setResult(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("store_id", storeId);

    const res = await fetch("/api/catalog/upload", {
      method: "POST",
      body: fd,
    });

    const json = (await res.json()) as UploadResult;
    setResult(json);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Catalog Upload</div>
        <div className="text-sm text-gray-600">
          Store: <span className="font-medium">{storeName}</span>
        </div>
      </div>

      <Card title="Upload Excel">
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            Upload your <span className="font-medium">Master Catalog</span> Excel file.
            We will <span className="font-medium">upsert</span> by <span className="font-medium">Part Number (CLEAN)</span>:
            no duplicates, updates overwrite.
          </div>

          <div className="space-y-2">
            <Label>Excel File (.xlsx / .xlsm)</Label>
            <Input
              type="file"
              accept=".xlsx,.xlsm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button onClick={upload} disabled={!file || busy}>
            {busy ? "Uploading..." : "Upload → Supabase"}
          </Button>

          <div className="text-xs text-gray-500">
            Tip: Use the templates in this repo /templates.
          </div>
        </div>
      </Card>

      {result && (
        <Card title={result.ok ? "Upload Complete ✅" : "Upload Failed ❌"}>
          <div className="space-y-2 text-sm">
            {result.summary && (
              <ul className="list-disc pl-5">
                <li>Rows read: {result.summary.rowsRead}</li>
                <li>Deduped within file: {result.summary.dedupedWithinFile}</li>
                <li>Rows upserted: {result.summary.rowsUpserted}</li>
                <li>Errors: {result.summary.errors}</li>
              </ul>
            )}

            {result.errors && result.errors.length > 0 && (
              <div>
                <div className="font-semibold mt-2">Errors</div>
                <div className="mt-1 max-h-64 overflow-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs">
                  {result.errors.slice(0, 200).map((e, idx) => (
                    <div key={idx}>
                      Row {e.row}: {e.message} {e.part ? `(Part: ${e.part})` : ""}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
