import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Upload de imagem para ofertas foi descontinuado. Agora as ofertas vêm do Telegram.",
    },
    { status: 410 }
  )
}
