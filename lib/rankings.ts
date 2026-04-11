export type RankingItem = {
  name: string
  score: string
}

export type PeripheralReview = {
  slug: string
  peripheralName: string
  categorySlug: string
  categoryTitle: string
  score: string
  title: string
  summary: string
  image: string
  imageAlt: string
  tags: string[]
  readTime: string
  publishedAt: string
}

export type RankingCategory = {
  slug: string
  title: string
  rankingTitle: string
  image: string
  imageAlt: string
  summary: string
  score: string
  label: string
  items: RankingItem[]
  spanClassName?: string
}

export const rankingCategories: RankingCategory[] = [
  {
    slug: "mouses",
    title: "Melhores Mouses",
    rankingTitle: "Ranking de Mouses",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Mouse gamer sobre mesa escura",
    summary: "Precisao, leveza e sensor para FPS e rotina competitiva.",
    score: "9.6",
    label: "Top geral",
    items: [
      { name: "Logitech G Pro Superstrike X2", score: "9.6" },
      { name: "Vaxee XE Wireless", score: "9.4" },
      { name: "Razer Viper V3 Pro", score: "9.3" },
    ],
    spanClassName: "md:col-span-2 md:row-span-2 xl:col-span-2 xl:row-span-2",
  },
  {
    slug: "teclados",
    title: "Melhores Teclados",
    rankingTitle: "Ranking de Teclados",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Teclado mecanico com iluminacao em setup escuro",
    summary: "Acionamento, construcao e resposta para digitacao e jogo.",
    score: "9.5",
    label: "65% favorito",
    items: [
      { name: "Keychron Q1 Max", score: "9.5" },
      { name: "Wooting 60HE+", score: "9.4" },
      { name: "Leopold FC660C", score: "9.1" },
    ],
    spanClassName: "md:col-span-2 xl:col-span-2 xl:row-span-1",
  },
  {
    slug: "mousepads",
    title: "Melhores Mousepads",
    rankingTitle: "Ranking de Mousepads",
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Mousepad de tecido em mesa gamer",
    summary: "Deslizamento controlado e superficie estavel para mira limpa.",
    score: "9.4",
    label: "Controle premium",
    items: [
      { name: "Artisan Zero XL", score: "9.4" },
      { name: "LGG Saturn Pro", score: "9.2" },
      { name: "SteelSeries QcK Heavy", score: "8.9" },
    ],
    spanClassName: "md:col-span-1 md:row-span-1",
  },
  {
    slug: "headsets",
    title: "Melhores Headsets",
    rankingTitle: "Ranking de Headsets",
    image:
      "https://images.unsplash.com/photo-1518441902117-f0a2c4b3c8f1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Headset gamer com luzes de fundo",
    summary: "Som limpo, palco amplo e conforto para longas sessoes.",
    score: "9.6",
    label: "Audio claro",
    items: [
      { name: "Audeze Maxwell", score: "9.6" },
      { name: "SteelSeries Arctis Nova Pro", score: "9.2" },
      { name: "HyperX Cloud III", score: "8.8" },
    ],
    spanClassName: "md:col-span-1 md:row-span-1",
  },
  {
    slug: "controles",
    title: "Melhores Controles",
    rankingTitle: "Ranking de Controles",
    image:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Controle gamer sobre fundo escuro",
    summary: "Grip, botoes extras e resposta rapida para multiplataforma.",
    score: "9.3",
    label: "Mais versatil",
    items: [
      { name: "8BitDo Ultimate", score: "9.3" },
      { name: "DualSense Edge", score: "9.0" },
      { name: "Xbox Elite Series 2", score: "8.9" },
    ],
    spanClassName: "md:col-span-1 md:row-span-1",
  },
  {
    slug: "microfones",
    title: "Melhores Microfones",
    rankingTitle: "Ranking de Microfones",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Microfone de estudio em setup de criador",
    summary: "Captacao limpa para streaming, voz e reunioes com presenca.",
    score: "9.4",
    label: "Streaming ready",
    items: [
      { name: "Shure MV7+", score: "9.4" },
      { name: "Elgato Wave:3", score: "9.1" },
      { name: "HyperX QuadCast S", score: "8.8" },
    ],
    spanClassName: "md:col-span-1 md:row-span-1",
  },
  {
    slug: "monitores",
    title: "Melhores Monitores",
    rankingTitle: "Ranking de Monitores",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Monitor gaming em estacao moderna",
    summary: "Taxa alta, resposta rapida e cores para jogo e criacao.",
    score: "9.2",
    label: "Tela principal",
    items: [
      { name: "Alienware AW2725DF", score: "9.2" },
      { name: "LG 27GR95QE", score: "9.0" },
      { name: "Dell G2724D", score: "8.8" },
    ],
    spanClassName: "md:col-span-2 xl:col-span-2",
  },
]

export function getRankingBySlug(slug: string) {
  return rankingCategories.find((item) => item.slug === slug)
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const tagsByCategory: Record<string, string[]> = {
  mouses: ["Mouse", "Sensor", "FPS"],
  teclados: ["Teclado", "Switch", "Digitacao"],
  mousepads: ["Mousepad", "Controle", "Superficie"],
  headsets: ["Headset", "Audio", "Conforto"],
  controles: ["Controle", "Ergonomia", "Input"],
  microfones: ["Microfone", "Captacao", "Streaming"],
  monitores: ["Monitor", "Painel", "Refresh"],
}

const reviewDates = [
  "09 de abr. de 2026",
  "07 de abr. de 2026",
  "04 de abr. de 2026",
  "31 de mar. de 2026",
  "28 de mar. de 2026",
  "25 de mar. de 2026",
  "22 de mar. de 2026",
]

const reviewReadTimes = ["4 min", "5 min", "3 min", "6 min", "4 min", "7 min"]

export function getAllPeripheralReviews(): PeripheralReview[] {
  return rankingCategories.flatMap((category, categoryIndex) =>
    category.items.map((item, itemIndex) => {
      const slug = `${category.slug}-${slugify(item.name)}`
      const tagSet = tagsByCategory[category.slug] ?? ["Review", "Periferico", "Setup"]
      const date = reviewDates[(categoryIndex + itemIndex) % reviewDates.length]
      const readTime = reviewReadTimes[(categoryIndex * 2 + itemIndex) % reviewReadTimes.length]

      return {
        slug,
        peripheralName: item.name,
        categorySlug: category.slug,
        categoryTitle: category.title,
        score: item.score,
        title: `Review: ${item.name}`,
        summary: `Analise pratica do ${item.name} com foco em desempenho real, conforto e custo-beneficio para ${category.title.toLowerCase()}.`,
        image: `https://picsum.photos/seed/${slug}/640/360`,
        imageAlt: `Imagem ilustrativa do ${item.name}`,
        tags: tagSet,
        readTime,
        publishedAt: date,
      }
    })
  )
}

export function getReviewBySlug(slug: string) {
  return getAllPeripheralReviews().find((review) => review.slug === slug)
}
