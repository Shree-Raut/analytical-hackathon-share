"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  FolderOpen,
  Database,
  BookOpen,
  Sliders,
  Clock,
  Sparkles,
  Upload,
  ChevronDown,
  User,
  Library,
  Building2,
  Package,
  Activity,
} from "lucide-react";
import { RoleProvider, useRole, type Role } from "@/lib/role-context";
import { CustomerProvider, useCustomer } from "@/lib/customer-context";
import { ExplorerPanel } from "@/components/ai-explorer/explorer-panel";
import { type ReactNode, useState, useEffect, useCallback } from "react";

const NAV_SECTIONS = [
  {
    label: "CREATE",
    items: [
      { name: "Create Report", href: "/create", icon: Sparkles , disabled: true },
      { name: "Fast Pass", href: "/fast-pass", icon: Upload },
    ],
  },
  {
    label: "TODAY",
    items: [
      { name: "Briefing", href: "/briefing", icon: LayoutDashboard , disabled: true },
      { name: "Alerts", href: "/alerts", icon: AlertTriangle , disabled: true },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { name: "Company Menu", href: "/my-reports", icon: Building2 , disabled: true},
      { name: "Library", href: "/reports", icon: Library, disabled: true },
      { name: "My Workspace", href: "/workspace", icon: FolderOpen },
      { name: "Packets", href: "/packets", icon: Package, disabled: true },
    ],
  },
  {
    label: "DATA",
    items: [
      { name: "Data Sources", href: "/data/sources", icon: Database , disabled: true},
      { name: "Metric Definitions", href: "/data/metrics", icon: BookOpen },
    ],
  },
  {
    label: "CONFIGURE",
    items: [
      { name: "Thresholds & Alerts", href: "/configure/thresholds", icon: Sliders , disabled: true },
      { name: "Schedules", href: "/configure/schedules", icon: Clock , disabled: true },
    ],
  },
] as const;

const ROLE_LABELS: Record<Role, string> = {
  corporate: "Corporate",
  regional: "Regional",
  property: "Property",
  staff: "Staff",
};

function Sidebar({ onExplorerToggle }: { onExplorerToggle: () => void }) {
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const { customer, customers, setCustomer, switching } = useCustomer();

  const roles: Role[] = ["corporate", "regional", "property", "staff"];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside data-sidebar className="flex flex-col w-64 shrink-0 bg-white border-r border-[#e8dfd4] h-screen overflow-y-auto">
      {/* Logo — links to Platform Pulse */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 group transition-colors hover:bg-[#f7f3ef]">
        <div className="relative w-7 h-7 rounded-md bg-[#7d654e] flex items-center justify-center">
          <Activity size={14} strokeWidth={2} className="text-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none">2</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#1a1510] tracking-tight leading-tight">
            Analytics
          </span>
          <span className="text-[9px] text-[#7d654e]/60 font-medium tracking-wide">
            Platform Pulse
          </span>
        </div>
      </Link>

      {/* Nav Sections */}
      <nav className="flex-1 px-3 pb-4 space-y-5 mt-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-[#7d654e]/60 font-semibold">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const isDisabled = 'disabled' in item && item.disabled;
                
                const className = `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDisabled
                    ? "text-[#1a1510]/30 cursor-not-allowed opacity-50"
                    : active
                      ? "text-[#7d654e] bg-[#eddece]"
                      : "text-[#1a1510]/60 hover:text-[#1a1510] hover:bg-[#f7f3ef]"
                }`;
                
                return (
                  <li key={item.href}>
                    {isDisabled ? (
                      <div className={className}>
                        <Icon size={16} strokeWidth={1.8} />
                        {item.name}
                      </div>
                    ) : (
                      <Link href={item.href} className={className}>
                        <Icon size={16} strokeWidth={1.8} />
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: AI Explorer + Profile */}
      <div className="px-3 pb-4 mt-auto space-y-2">
        <button
          type="button"
          onClick={onExplorerToggle}
          disabled={true}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg text-[#1a1510]/60 hover:text-[#1a1510] hover:bg-[#f7f3ef] transition-colors"
        >
          <Sparkles size={16} strokeWidth={1.8} />
          <span>AI Explorer</span>
          <kbd className="ml-auto text-[10px] text-[#7d654e]/60 bg-[#faf7f4] border border-[#e8dfd4] px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Customer Selector */}
        {customers.length > 1 && (
          <div className="border-t border-[#e8dfd4] pt-3 pb-2">
            <div className="px-3">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[#7d654e]/60 font-semibold mb-1.5">Customer</div>
              <div className="relative">
                <select
                  value={customer?.id ?? ""}
                  onChange={(e) => {
                    const next = customers.find((c) => c.id === e.target.value);
                    if (next) setCustomer(next);
                  }}
                  // disabled={switching}
                  disabled={true}
                  className="appearance-none w-full bg-[#f7f3ef] border border-[#e8dfd4] rounded-lg text-xs font-medium text-[#1a1510] px-3 py-1.5 pr-7 cursor-pointer transition-colors hover:border-[#7d654e]/40 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white text-[#1a1510]">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7d654e]/60 pointer-events-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-[#e8dfd4] pt-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-7 h-7 rounded-full bg-[#eddece] flex items-center justify-center">
              <User size={13} strokeWidth={2} className="text-[#7d654e]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#1a1510] truncate">Demo User</div>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  disabled={true}
                  className="appearance-none bg-transparent text-[11px] text-[#7d654e] hover:text-[#1a1510] cursor-pointer pr-4 transition-colors outline-none"
                >
                  {roles.map((r) => (
                    <option key={r} value={r} className="bg-white text-[#1a1510]">
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7d654e]/60 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LayoutInner({ children }: { children: ReactNode }) {
  const [explorerOpen, setExplorerOpen] = useState(false);

  const toggleExplorer = useCallback(() => setExplorerOpen((v) => !v), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleExplorer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleExplorer]);

  return (
    <div className="flex h-screen bg-[#faf7f4] overflow-hidden">
      <Sidebar onExplorerToggle={toggleExplorer} />
      <main className="flex-1 overflow-y-auto">
        <div className="animate-analytics-fade-in">{children}</div>
      </main>
      <ExplorerPanel isOpen={explorerOpen} onClose={() => setExplorerOpen(false)} />
    </div>
  );
}

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <CustomerProvider>
        <LayoutInner>{children}</LayoutInner>
      </CustomerProvider>
    </RoleProvider>
  );
}
