"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface SidebarContextValue {
  publicCollapsed: boolean
  adminCollapsed: boolean
  isMobileOpen: boolean
  isAdminMobileOpen: boolean
  togglePublic: () => void
  toggleAdmin: () => void
  setMobileOpen: (open: boolean) => void
  setAdminMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [publicCollapsed, setPublicCollapsed] = useState(false)
  const [adminCollapsed, setAdminCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isAdminMobileOpen, setIsAdminMobileOpen] = useState(false)

  // No desktop a sidebar é fixa e o overlay some, então um drawer que ficou "aberto"
  // ao girar/redimensionar a tela travaria o scroll sem nada visível para fechá-lo.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)")
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsMobileOpen(false)
        setIsAdminMobileOpen(false)
      }
    }
    handleChange(desktop)
    desktop.addEventListener("change", handleChange)
    return () => desktop.removeEventListener("change", handleChange)
  }, [])

  // Trava o scroll do body enquanto o drawer mobile estiver aberto, evitando que a
  // página por trás do overlay role junto. `overflow: hidden` sozinho é ignorado pelo
  // Safari iOS, então também fixamos o body na posição atual e restauramos o scroll
  // ao fechar — senão a página volta para o topo.
  useEffect(() => {
    const shouldLock = isMobileOpen || isAdminMobileOpen
    if (!shouldLock) return

    const { body } = document
    const scrollY = window.scrollY
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }

    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"

    return () => {
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      window.scrollTo(0, scrollY)
    }
  }, [isMobileOpen, isAdminMobileOpen])

  return (
    <SidebarContext.Provider
      value={{
        publicCollapsed,
        adminCollapsed,
        isMobileOpen,
        isAdminMobileOpen,
        togglePublic: () => setPublicCollapsed((prev) => !prev),
        toggleAdmin: () => setAdminCollapsed((prev) => !prev),
        setMobileOpen: setIsMobileOpen,
        setAdminMobileOpen: setIsAdminMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}
