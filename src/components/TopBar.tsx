"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";

export function TopBar() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="text-sm text-gray-600">Signed in as <span className="font-medium">{email}</span></div>
      <Button onClick={logout}>Logout</Button>
    </header>
  );
}
