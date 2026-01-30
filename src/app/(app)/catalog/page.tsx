"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Card, Input } from "@/components/ui";

type Row = {
  part_number_clean: string;
  part_number_raw: string | null;
  description: string | null;
  category: string | null;
  make: string | null;
  model: string | null;
  year_start: number | null;
  list_price: number | null;
  cost: number | null;
};

export default function CatalogSearchPage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("store_users")
      .select("stores(id)")
      .limit(1)
      .single()
      .then(({ data }) => setStoreId((data?.stores?.id as string) ?? ""));
  }, [supabase]);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    async function run() {
      if (!storeId) return;
      setLoading(true);

      let req = supabase
        .from("parts_master_catalog")
        .select(
          "part_number_clean, part_number_raw, description, category, make, model, year_start, list_price, cost"
        )
        .eq("store_id", storeId)
        .order("part_number_clean", { ascending: true })
        .limit(50);

      if (query) {
        // simple contains search (trgm index helps later)
        req = req.or(
          `part_number_clean.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data } = await req;
      setRows((data as Row[]) ?? []);
      setLoading(false);
    }
    run();
  }, [supabase, storeId, query]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Catalog Search</div>
        <div className="text-sm text-gray-600">Search your Master Catalog (store-scoped).</div>
      </div>

      <Card title="Search">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part number or description..." />
        <div className="text-xs text-gray-500 mt-2">
          Showing up to 50 results {loading ? "…loading" : ""}
        </div>
      </Card>

      <Card title="Results">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Part #</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Fitment</th>
                <th className="py-2 pr-4">List</th>
                <th className="py-2 pr-4">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.part_number_clean} className="border-b">
                  <td className="py-2 pr-4 font-medium">{r.part_number_clean}</td>
                  <td className="py-2 pr-4">{r.description ?? ""}</td>
                  <td className="py-2 pr-4">{r.category ?? ""}</td>
                  <td className="py-2 pr-4">
                    {[r.year_start, r.make, r.model].filter(Boolean).join(" ")}
                  </td>
                  <td className="py-2 pr-4">{r.list_price ?? ""}</td>
                  <td className="py-2 pr-4">{r.cost ?? ""}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={6}>
                    No results.
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
