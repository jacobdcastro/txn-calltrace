"use client"

import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/providers/theme-provider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-foreground data-[state=unchecked]:bg-foreground"
      />
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    </div>
  )
} 