"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/semana/1", label: "01 / fundamentos" },
  { href: "/semana/2", label: "02 / árboles" },
  { href: "/semana/3", label: "03 / regresión & NLP" },
  { href: "/progreso", label: "progreso" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(255,255,255,0.07)] bg-[#0f0f11]/95 backdrop-blur">
      <div className="flex h-14 items-center px-6">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <span className="text-base font-medium tracking-tight">ML Simulator</span>
          <span className="font-mono text-xs text-[#888892]">v1.0</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-5 py-4 font-mono text-[13px] border-b-2 border-transparent transition-colors",
                pathname.startsWith(item.href)
                  ? "text-foreground border-b-ml-green"
                  : "text-[#888892] hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden ml-auto p-2 text-[#888892] hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-[rgba(255,255,255,0.07)] p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-2.5 rounded font-mono text-[13px] transition-colors",
                pathname.startsWith(item.href)
                  ? "text-foreground bg-[#1e1e24]"
                  : "text-[#888892] hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
