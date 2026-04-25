import { NextResponse } from "next/server"

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Edição manual de ofertas foi descontinuada. Agora as ofertas vêm do Telegram.",
    },
    { status: 410 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Exclusão manual de ofertas foi descontinuada. Agora as ofertas vêm do Telegram.",
    },
    { status: 410 }
  )
}
