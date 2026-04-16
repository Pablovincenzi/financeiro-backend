"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

type DashboardSidebarNavProps = {
  links: NavLink[];
};

export function DashboardSidebarNav({ links }: DashboardSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center rounded-[1.15rem] px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-[linear-gradient(135deg,_rgba(48,113,196,0.22),_rgba(242,125,36,0.2))] text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
                : "text-slate-300 hover:bg-white/6 hover:text-white"
            }`}
          >
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
