"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card } from "@/components/ui";

type IntakeRow = {
  id: string;
  source_type: string;
  file_name: string;
  status: string;
  created_at: string;
  error_text: string | null;
};

export default function IntakePage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [rows, setRows] = useState<IntakeRow[]>([]);

  useEffect(() => {
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
        .from("intake_files")
        .select("id, source_type, file_name, status, created_at, error_text")
        .eq("store_id", sid)
        .order("created_at", { ascending: false })
        .limit(100);

      setRows((data as IntakeRow[]) ?? []);
    }
    load();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Intake Monitor</div>
        <div className="text-sm text-gray-600">Shows files uploaded by the Agent (last 100).</div>
      </div>

      <Card title="Intake Files">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">{r.source_type}</td>
                  <td className="py-2 pr-4">{r.file_name}</td>
                  <td className="py-2 pr-4">{r.status}</td>
                  <td className="py-2 pr-4 text-red-600">{r.error_text ?? ""}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={5}>
                    No intake files yet.
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
