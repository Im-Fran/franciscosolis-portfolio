import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * ThemeToggle component provides a button to switch between light and dark modes
 * Uses next-themes to manage theme state
 */
export const ThemeToggle = () => {
  const { setTheme } = useTheme()

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant={"outline"} size={"icon"} className={"border-gray-700 bg-transparent"}>
        <Sun className={"h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-300"} />
        <Moon className={"absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-300"} />
        <span className={"sr-only"}>Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={"end"} className={"bg-gray-900 border-gray-800"}>
      <DropdownMenuItem onClick={() => setTheme("light")} className={"text-gray-300 hover:text-white focus:text-white"}>
        Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")} className={"text-gray-300 hover:text-white focus:text-white"}>
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")} className={"text-gray-300 hover:text-white focus:text-white"}>
        System
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}

