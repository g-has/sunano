"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "@/components/providers/theme-context"

export function Toaster() {
  const { theme } = useTheme()
  const isLight = theme === "light"

  return (
    <SonnerToaster
      position="top-right"
      theme={isLight ? "light" : "dark"}
      richColors
      closeButton
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-border bg-card text-foreground shadow-xl shadow-black/40 backdrop-blur-md",
          title: "text-sm font-semibold",
          description: "text-xs text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton: "border border-border bg-card text-muted-foreground",
        },
      }}
    />
  )
}
