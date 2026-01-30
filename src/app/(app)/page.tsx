import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { MODULES } from "@/modules/registry";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: membership } = await supabase
    .from("store_users")
    .select("role, stores(id, name, store_code)")
    .limit(1)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Dashboard</div>
        <div className="text-sm text-gray-600">
          Store: <span className="font-medium">{membership?.stores?.name ?? "Unknown"}</span>{" "}
          ({membership?.stores?.store_code ?? ""}) — Role:{" "}
          <span className="font-medium">{membership?.role ?? "?"}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">User: {user?.email ?? ""}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.filter((m) => m.href !== "/").map((m) => (
          <Link key={m.id} href={m.href}>
            <Card title={m.label}>
              <div className="text-sm text-gray-600">{m.description}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
