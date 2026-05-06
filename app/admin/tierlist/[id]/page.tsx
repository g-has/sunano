import { PeripheralForm } from "../form"

interface PeripheralEditPageProps {
  params: Promise<{ id: string }>
}

export default async function PeripheralEditPage({ params }: PeripheralEditPageProps) {
  const { id } = await params
  return <PeripheralForm peripheralId={id} />
}
