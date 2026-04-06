import { CartIcon } from './Icons';

type BrandHeaderProps = {
  cartCount: number;
  onGoHome: () => void;
  onOpenCart: () => void;
};

export function BrandHeader({ cartCount, onGoHome, onOpenCart }: BrandHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div />
          <button type="button" onClick={onGoHome} className="justify-self-center text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 shadow-sm">
                <img
                  src="/logo-bonequinho.png"
                  alt="Logo Araujo Premiacoes"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Araujo premiacoes</p>
                <h1 className="text-lg font-semibold text-stone-950">Sorteios online</h1>
              </div>
            </div>
          </button>
          <div className="justify-self-end">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <CartIcon />
              Carrinho
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
