import { ShoppingBag } from "lucide-react"
import { ComingSoon } from "@/components/store/ComingSoon"

export default function LojaPage() {
  return (
    <ComingSoon
      icon={ShoppingBag}
      title="Loja"
      description="A loja com produtos selecionados pelo Sunano está sendo preparada. Fique de olho nas redes para o lançamento."
      accent="emerald"
    />
  )
}
