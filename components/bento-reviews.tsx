import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { rankingCategories } from "@/lib/rankings"

export function BentoReviews() {
  return (
    <section className="px-4 lg:px-6">
      <BentoGrid className="grid-cols-1 auto-rows-[15rem] gap-5 md:grid-cols-4 xl:grid-cols-4">
        {rankingCategories.map((rank) => (
          <BentoCard
            key={rank.title}
            href={`/ranking/${rank.slug}`}
            className={cn(
              "relative border border-white/15 bg-black/20 text-white shadow-none backdrop-blur-xl",
              rank.spanClassName
            )}
            name={rank.title}
            description={rank.summary}
            background={
              <>
                <img
                  src={rank.image}
                  alt={rank.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/0" />
                <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {rank.label}
                </div>
              </>
            }
          >
            <div className="relative z-10 mt-5 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.22em] text-white/70">
                  Clique para abrir ranking
                </p>
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur-md">
                  {rank.score}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="border-white/20 text-white">
                  Top 3
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {rank.label}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {rank.score}
                </Badge>
              </div>
            </div>
          </BentoCard>
        ))}
      </BentoGrid>
    </section>
  )
}
