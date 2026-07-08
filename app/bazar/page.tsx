import { Recycle } from "lucide-react"
import { ComingSoon } from "@/components/store/ComingSoon"

export default function BazarPage() {
  return (
    <ComingSoon
      icon={Recycle}
      title="Bazar"
      description="O Bazar com equipamentos usados e testados pelo Sunano está sendo preparado. Fique de olho nas redes para o lançamento."
      accent="amber"
    />
  )
}
