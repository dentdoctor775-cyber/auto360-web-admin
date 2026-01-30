"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { MODULES } from "@/modules/registry";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 bg-white">
      <div className="px-4 py-4">
        <div className="text-lg font-bold">AUTO360</div>
        <div className="text-xs text-gray-500">Web Admin</div>
      </div>

      <nav className="px-2 pb-4">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const active = pathname === m.href || pathname.startsWith(m.href + "/");
          return (
            <Link
              key={m.id}
              href={m.href}
              className={clsx(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-gray-100 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon size={16} />
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
