"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Card, Input, Label } from "@/components/ui";

type HubItem = {
  id: string;
  item_type: string;
  title: string;
  content: any;
  updated_at: string;
};

export default function HubPage() {
  const supabase = createSupabaseBrowserClient();
  const [storeId, setStoreId] = useState<string>("");
  const [items, setItems] = useState<HubItem[]>([]);

  // create form
  const [type, setType] = useState<"NOTE" | "LINK">("NOTE");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

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
      .from("info_hub_items")
      .select("id, item_type, title, content, updated_at")
      .eq("store_id", sid)
      .order("updated_at", { ascending: false })
      .limit(100);

    setItems((data as HubItem[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addItem() {
    if (!storeId) return;
    if (!title.trim()) return;

    setStatus("Saving...");
    const payload =
      type === "NOTE"
        ? { text: text.trim() }
        : { url: url.trim(), note: text.trim() };

    const { error } = await supabase.from("info_hub_items").insert({
      store_id: storeId,
      item_type: type,
      title: title.trim(),
      content: payload,
    });

    setStatus(error ? `Error: ${error.message}` : "Saved ✅");
    setTitle("");
    setText("");
    setUrl("");
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Info Hub</div>
        <div className="text-sm text-gray-600">
          A simple, customizable place to store notes + links for your team (SOPs, vendor links, training, etc.).
        </div>
      </div>

      <Card title="Add Item" right={<Button onClick={addItem}>Add</Button>}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="NOTE">Note</option>
              <option value="LINK">Link</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="DYMO Setup" />
          </div>

          {type === "LINK" && (
            <div className="space-y-2 md:col-span-2">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label>{type === "NOTE" ? "Note" : "Note / Description"}</Label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type here..."
            />
          </div>
        </div>

        {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
      </Card>

      <Card title="Latest Items">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="rounded border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{it.title}</div>
                <div className="text-xs text-gray-500">{new Date(it.updated_at).toLocaleString()}</div>
              </div>

              {it.item_type === "LINK" ? (
                <div className="mt-2 text-sm">
                  <a className="text-blue-700 underline" href={it.content?.url} target="_blank">
                    {it.content?.url}
                  </a>
                  {it.content?.note && <div className="mt-1 text-gray-700">{it.content.note}</div>}
                </div>
              ) : (
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {it.content?.text ?? ""}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-gray-500">No Info Hub items yet.</div>}
        </div>
      </Card>
    </div>
  );
}
