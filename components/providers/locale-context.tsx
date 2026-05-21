"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_LOCALE, getLocale, LANGUAGE_STORAGE_KEY, type LocaleCode } from "@/lib/i18n"

type LocaleContextValue = {
  locale: LocaleCode
  setLocale: (nextLocale: LocaleCode) => void
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE)

  useEffect(() => {
    const storedLocale = getLocale(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
    setLocaleState(storedLocale)
    document.documentElement.lang = storedLocale
  }, [])

  const setLocale = (nextLocale: LocaleCode) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLocale)
    document.documentElement.lang = nextLocale
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
