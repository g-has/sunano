import { unstable_cache } from "next/cache"

type TelegramChat = {
  id?: number
  title?: string
  username?: string
  type?: string
}

type TelegramMessage = {
  message_id?: number
  date?: number
  text?: string
  caption?: string
  chat?: TelegramChat
  from?: {
    first_name?: string
    username?: string
  }
}

type TelegramUpdate = {
  update_id?: number
  message?: TelegramMessage
  channel_post?: TelegramMessage
}

type TelegramGetUpdatesResponse = {
  ok?: boolean
  result?: TelegramUpdate[]
  description?: string
}

export type TelegramOffer = {
  id: string
  messageId: number
  text: string
  date: string
  author: string | null
  chatTitle: string | null
  url: string | null
}

export type TelegramOffersResult = {
  offers: TelegramOffer[]
  source: "telegram"
  warning: string | null
}

function normalizeChatId(value: string | null | undefined) {
  if (!value) return null
  return value.trim()
}

function buildTelegramMessageUrl(message: TelegramMessage, fallbackUrl: string | null) {
  const username = message.chat?.username
  const messageId = message.message_id

  if (!messageId) return fallbackUrl
  if (username) return `https://t.me/${username}/${messageId}`
  if (!fallbackUrl) return null

  return `${fallbackUrl.replace(/\/$/, "")}/${messageId}`
}

async function fetchTelegramOffers(limit = 30): Promise<TelegramOffersResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const configuredChatId = normalizeChatId(process.env.TELEGRAM_OFFERS_CHAT_ID)
  const fallbackPublicUrl = process.env.TELEGRAM_OFFERS_PUBLIC_URL?.trim() || null

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN não configurado.")
  }

  if (!configuredChatId) {
    throw new Error("TELEGRAM_OFFERS_CHAT_ID não configurado.")
  }

  const params = new URLSearchParams()
  params.set("limit", "100")
  params.set("allowed_updates", JSON.stringify(["message", "channel_post"]))

  const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?${params.toString()}`)
  const data = (await response.json()) as TelegramGetUpdatesResponse

  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error (${response.status})`)
  }

  const messages = (data.result ?? [])
    .map((update) => update.message || update.channel_post)
    .filter((message): message is TelegramMessage => Boolean(message))
    .filter((message) => {
      const chat = message.chat
      if (!chat) return false

      if (configuredChatId.startsWith("@")) {
        return `@${chat.username || ""}`.toLowerCase() === configuredChatId.toLowerCase()
      }

      return String(chat.id || "") === configuredChatId
    })
    .filter((message) => {
      const text = (message.text || message.caption || "").trim()
      return text.length > 0
    })
    .sort((a, b) => (b.date || 0) - (a.date || 0))

  const offers = messages.slice(0, limit).map((message) => {
    const text = (message.text || message.caption || "").trim()
    const date = message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString()

    return {
      id: `telegram-${message.message_id || Math.random().toString(36).slice(2)}`,
      messageId: message.message_id || 0,
      text,
      date,
      author: message.from?.first_name || message.from?.username || null,
      chatTitle: message.chat?.title || null,
      url: buildTelegramMessageUrl(message, fallbackPublicUrl),
    }
  })

  const warning =
    offers.length === 0
      ? "Nenhuma mensagem encontrada no grupo configurado. Verifique se o bot está no grupo e com permissões de leitura."
      : null

  return {
    offers,
    source: "telegram",
    warning,
  }
}

const getCachedTelegramOffers = unstable_cache(
  async (limit: number) => fetchTelegramOffers(limit),
  ["telegram-offers-v1"],
  { revalidate: 300 }
)

export async function getTelegramOffers(limit = 30): Promise<TelegramOffersResult> {
  return getCachedTelegramOffers(limit)
}
