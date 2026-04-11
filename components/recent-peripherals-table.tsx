import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const peripheralsBackgroundImage =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=2000&q=80"

const recentPeripherals = [
  {
    periferial: "Logitech G Pro X Superlight 2",
    category: "Mouse",
    brand: "Logitech",
    score: "9.6",
    reviewedAt: "10/04/2026",
  },
  {
    periferial: "Keychron Q1 Max",
    category: "Teclado",
    brand: "Keychron",
    score: "9.4",
    reviewedAt: "10/04/2026",
  },
  {
    periferial: "Artisan Zero XL",
    category: "Mousepad",
    brand: "Artisan",
    score: "9.2",
    reviewedAt: "09/04/2026",
  },
  {
    periferial: "Razer BlackShark V2 Pro",
    category: "Headset",
    brand: "Razer",
    score: "8.9",
    reviewedAt: "09/04/2026",
  },
  {
    periferial: "HyperX Pulsefire Haste 2",
    category: "Mouse",
    brand: "HyperX",
    score: "8.7",
    reviewedAt: "08/04/2026",
  },
]

export function RecentPeripheralsTable() {
  return (
    <section className="px-4 pb-4 lg:px-6 lg:pb-6">
      <div
        className="relative overflow-hidden rounded-2xl border border-border/40"
      >
        <div
          className="pointer-events-none absolute inset-[-24px] scale-110 bg-cover bg-center blur-xl"
          style={{ backgroundImage: `url(${peripheralsBackgroundImage})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <Card className="relative border-0 bg-transparent text-white shadow-none ring-0">
          <CardHeader>
            <CardDescription className="text-white/70">
              Ultimos perifericos avaliados
            </CardDescription>
            <CardTitle>Tabela de reviews recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
            <TableHeader>
              <TableRow className="border-white/30 hover:bg-transparent">
                <TableHead className="text-white/90">Periferico</TableHead>
                <TableHead className="text-white/90">Categoria</TableHead>
                <TableHead className="text-white/90">Marca</TableHead>
                <TableHead className="text-white/90">Nota</TableHead>
                <TableHead className="text-white/90">Data da review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPeripherals.map((item) => (
                <TableRow
                  key={item.periferial}
                  className="border-white/20 hover:bg-white/10"
                >
                  <TableCell className="font-medium">{item.periferial}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.brand}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{item.reviewedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}