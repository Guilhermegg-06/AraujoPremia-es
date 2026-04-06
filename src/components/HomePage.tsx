import { KitVisual } from './KitVisual';
import type { Raffle } from '../types/raffle';
import { formatCurrency, formatNumber } from '../utils/formatters';

type HomePageProps = {
  raffle: Raffle;
  availableNumbers: number;
  onOpenRaffle: () => void;
  onOpenCart: () => void;
};

export function HomePage({ raffle, availableNumbers, onOpenRaffle, onOpenCart }: HomePageProps) {
  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[36px] border border-black/5 bg-white px-5 py-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_55%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
              <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">Sorteio em destaque</span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5">Escolha seus numeros e compre no WhatsApp</span>
            </div>

            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Premio da vez</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">{raffle.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">{raffle.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onOpenRaffle}
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Escolher numeros
              </button>
              <button
                type="button"
                onClick={onOpenCart}
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
              >
                Abrir carrinho
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-black/5 bg-[#f8faf7] p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Resumo rapido</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-stone-500">Valor por numero</p>
                <p className="mt-1 text-3xl font-semibold text-stone-950">{formatCurrency(raffle.price)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm text-stone-500">Numeros disponiveis</p>
                <p className="mt-1 text-3xl font-semibold text-stone-950">{formatNumber(availableNumbers)}</p>
              </div>
              <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-sm">
                <p className="text-sm text-white/80">Data do sorteio</p>
                <p className="mt-1 text-lg font-semibold">{raffle.date}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <KitVisual raffle={raffle} />

        <article className="rounded-[34px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">{raffle.category}</p>
              <h3 className="mt-3 text-2xl font-semibold text-stone-950">{raffle.title}</h3>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{raffle.highlight}</span>
          </div>

          <p className="mt-4 text-sm leading-7 text-stone-600">{raffle.description}</p>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Composicao do kit</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {raffle.items.map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-stone-800 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Progresso da campanha</span>
                <span className="font-semibold text-stone-900">
                  {formatNumber(raffle.soldNumbers)} / {formatNumber(raffle.totalNumbers)}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-950"
                  style={{ width: `${(raffle.soldNumbers / raffle.totalNumbers) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRaffle}
            className="mt-6 w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Abrir sorteio
          </button>
        </article>
      </div>
    </section>
  );
}
