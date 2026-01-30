"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);

    if (error) setError(error.message);
    else window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-2xl font-bold">AUTO360</div>
        <div className="text-sm text-gray-500 mb-6">Web Admin Login</div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>

        <div className="mt-4 space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        <Button className="mt-6 w-full" onClick={login} disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </Button>

        <div className="mt-4 text-xs text-gray-500">
          Tip: Create users in Supabase → Authentication → Users.
        </div>
      </div>
    </div>
  );
}
