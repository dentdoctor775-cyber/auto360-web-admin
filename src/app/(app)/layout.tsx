import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
