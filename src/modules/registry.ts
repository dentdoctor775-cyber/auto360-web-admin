import {
  LayoutDashboard,
  Settings,
  Upload,
  Search,
  Laptop,
  Inbox,
  Info,
} from "lucide-react";

export type ModuleItem = {
  id: string;
  label: string;
  href: string;
  icon: any;
  description?: string;
};

export const MODULES: ModuleItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview + quick links",
  },
  {
    id: "setup",
    label: "Setup Wizard",
    href: "/settings",
    icon: Settings,
    description: "Folder paths, printers, scan defaults",
  },
  {
    id: "catalog-upload",
    label: "Catalog Upload",
    href: "/catalog/upload",
    icon: Upload,
    description: "Excel → Master Catalog (no duplicates)",
  },
  {
    id: "catalog-search",
    label: "Catalog Search",
    href: "/catalog",
    icon: Search,
    description: "Search your Master Catalog",
  },
  {
    id: "devices",
    label: "Devices",
    href: "/devices",
    icon: Laptop,
    description: "Create device keys for the Agent",
  },
  {
    id: "intake",
    label: "Intake Monitor",
    href: "/intake",
    icon: Inbox,
    description: "Files uploaded by the Agent",
  },
  {
    id: "hub",
    label: "Info Hub",
    href: "/hub",
    icon: Info,
    description: "Custom notes & links for your team",
  },
];
