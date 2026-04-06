import { BackIcon } from './Icons';
import { KitVisual } from './KitVisual';
import type { Raffle, RaffleNumber } from '../types/raffle';
import { formatCurrency, formatNumber, formatTicketNumber } from '../utils/formatters';

type RaffleDetailPageProps = {
  raffle: Raffle;
  numbers: RaffleNumber[];
  selectedNumbers: number[];
  currentCartNumbers: number[];
  maxSelection: number;
  onBackHome: () => void;
  onToggleNumber: (value: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export function RaffleDetailPage({
  raffle,
  numbers,
  selectedNumbers,
  currentCartNumbers,
  maxSelection,
  onBackHome,
  onToggleNumber,
  onAddToCart,
  onBuyNow
}: RaffleDetailPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[30px] border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
          onClick={onBackHome}
        >
          <BackIcon />
          Voltar para os sorteios
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Disponivel para compra
          </span>
          <span className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
            {formatCurrency(raffle.price)} por numero
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className="space-y-6">
          <KitVisual raffle={raffle} />

          <div className="rounded-[34px] border border-black/5 bg-white p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Mapa de numeros</p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">Quadrados organizados para selecao rapida</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Agora o sorteio desse kit esta sozinho na tela e a grade de numeros ficou ainda mais facil de usar.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">Disponivel</span>
                <span className="rounded-full bg-stone-100 px-3 py-2 text-stone-500">Indisponivel</span>
                <span className="rounded-full bg-stone-950 px-3 py-2 text-white">Selecionado</span>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-black/5 bg-[#fbfcfa] p-3 sm:p-4">
              <div className="number-scroll max-h-[34rem] overflow-auto pr-1">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  {numbers.map((item) => {
                    const isSelected = selectedNumbers.includes(item.number);

                    return (
                      <button
                        key={item.number}
                        type="button"
                        onClick={() => {
                          if (!item.sold) {
                            onToggleNumber(item.number);
                          }
                        }}
                        disabled={item.sold}
                        className={`h-12 rounded-2xl border text-xs font-semibold transition sm:h-14 sm:text-sm ${
                          item.sold
                            ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                            : isSelected
                              ? 'border-stone-950 bg-stone-950 text-white shadow-sm'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                        }`}
                      >
                        {formatTicketNumber(item.number)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Resumo</p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">Sua selecao</h3>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
                Maximo de {maxSelection}
              </span>
            </div>

            <div className="mt-6 space-y-3 rounded-[26px] bg-stone-50 p-4 text-sm text-stone-600">
              <div className="flex items-center justify-between">
                <span>Numeros escolhidos</span>
                <span className="font-semibold text-stone-950">{selectedNumbers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Valor unitario</span>
                <span className="font-semibold text-stone-950">{formatCurrency(raffle.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ja no carrinho</span>
                <span className="font-semibold text-stone-950">{currentCartNumbers.length}</span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Numeros selecionados</p>
              {selectedNumbers.length === 0 ? (
                <p className="mt-3 rounded-[22px] border border-dashed border-stone-200 px-4 py-5 text-sm leading-6 text-stone-500">
                  Nenhum numero selecionado ainda. Toque nos quadrados livres para montar o pedido.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedNumbers.map((number) => (
                    <span key={number} className="rounded-2xl bg-stone-950 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                      {formatTicketNumber(number)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Total</span>
              <span className="text-3xl font-semibold text-stone-950">{formatCurrency(raffle.price * selectedNumbers.length)}</span>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={onAddToCart}
                disabled={selectedNumbers.length === 0}
                className="w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                Adicionar ao carrinho
              </button>
              <button
                type="button"
                onClick={onBuyNow}
                disabled={selectedNumbers.length === 0}
                className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
              >
                Comprar agora pelo WhatsApp
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
