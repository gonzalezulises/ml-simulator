"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/semana/1", label: "Semana 1" },
  { href: "/semana/2", label: "Semana 2" },
  { href: "/semana/3", label: "Semana 3" },
  { href: "/progreso", label: "Progreso" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center gap-2 font-bold">
          <Brain className="h-5 w-5" />
          <span>ML Simulator</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                size="sm"
              >
                {item.label === "Progreso" && <BarChart3 className="mr-1 h-4 w-4" />}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              <Button
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                size="sm"
                className={cn("w-full justify-start")}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
