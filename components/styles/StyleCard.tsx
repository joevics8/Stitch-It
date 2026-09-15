import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Style } from '@/lib/styles';
import { formatNaira } from '@/lib/styles';

export function StyleCard({ style, href }: { style: Style; href?: string }) {
  const image = style.images[0];

  return (
    <Link href={href ?? `/styles/${style.id}`} className="block group">
      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-muted mb-2">
        {style.is_new && (
          <span className="absolute top-2 left-2 z-10 bg-[hsl(var(--verified))] text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm">
            New
          </span>
        )}
        <button
          aria-label="Save to favorites"
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center"
        >
          <Heart className="h-4 w-4" />
        </button>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={style.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            No image yet
          </div>
        )}
      </div>
      <p className="text-sm font-medium leading-snug line-clamp-2">{style.name}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-semibold text-[hsl(var(--verified))]">{formatNaira(style.price)}</span>
        {style.compare_at_price && style.compare_at_price > style.price && (
          <span className="text-xs text-muted-foreground line-through">
            {formatNaira(style.compare_at_price)}
          </span>
        )}
      </div>
    </Link>
  );
}
