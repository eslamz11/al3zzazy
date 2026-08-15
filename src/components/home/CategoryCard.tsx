import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/common/SmartImage";
import { useHref, useLocalized } from "@/lib/locale";
import type { Category } from "@/lib/types";

/** Category tile with image, gradient overlay and animated arrow. */
export function CategoryCard({
  category,
  priority = false,
}: {
  category: Category;
  priority?: boolean;
}) {
  const href = useHref();
  const L = useLocalized();
  const description = L(category.description);

  return (
    <Link
      to={href(`/collections/${category.handle}`)}
      className="group relative block overflow-hidden rounded-3xl shadow-sm transition-shadow duration-500 hover:shadow-xl"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-surface-secondary">
        <SmartImage
          src={category.image}
          alt={L(category.name)}
          objectFit="cover"
          priority={priority}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, 400px"
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-6 md:p-7">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold text-white md:text-2xl">{L(category.name)}</h3>
          {description ? (
            <p className="mt-1 line-clamp-1 text-sm text-white/80">{description}</p>
          ) : null}
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg transition-all duration-300 group-hover:bg-brand-yellow group-hover:text-slate-950">
          <ArrowRight className="size-5 rtl:-scale-x-100" />
        </span>
      </div>
    </Link>
  );
}
