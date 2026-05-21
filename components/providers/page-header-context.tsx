"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type PageHeader = {
  title?: string
  description?: string
}

type PageHeaderContextValue = {
  header: PageHeader
  setHeader: (next: PageHeader) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined)

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<PageHeader>({})
  const value = useMemo(() => ({ header, setHeader }), [header])
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

/**
 * Set the TopBar title/description for the current page.
 *
 * The hook clears the override on unmount, so the TopBar falls back to the
 * pathname-based default when navigating away. Both arguments are reactive —
 * pass derived values (e.g. translated strings, selected category) and the
 * TopBar updates as state changes.
 */
export function usePageHeader(title?: string, description?: string) {
  const ctx = useContext(PageHeaderContext)
  const setHeader = ctx?.setHeader

  useEffect(() => {
    if (!setHeader) return
    setHeader({ title, description })
    return () => setHeader({})
  }, [title, description, setHeader])
}

/** Read the current TopBar override. Used by the TopBar itself. */
export function usePageHeaderState(): PageHeader {
  return useContext(PageHeaderContext)?.header ?? {}
}
