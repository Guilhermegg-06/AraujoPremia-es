import { BackIcon } from './Icons';
import type { CartItem, Raffle } from '../types/raffle';
import { formatCurrency, formatTicketNumber } from '../utils/formatters';

type CartPageProps = {
  raffle: Raffle;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartCheckoutUrl: string;
  onBackHome: () => void;
};

export function CartPage({ raffle, cartItems, cartCount, cartTotal, cartCheckoutUrl, onBackHome }: CartPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[30px] border border-black/5 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Carrinho</p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">Resumo da compra</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            onClick={onBackHome}
          >
            <BackIcon />
            Voltar para a home
          </button>
          <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            {cartCount} numeros no carrinho
          </span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-[34px] border border-dashed border-black/10 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Carrinho vazio</p>
          <h3 className="mt-3 text-3xl font-semibold text-stone-950">Nenhum numero separado ainda.</h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
            Volte para o sorteio do kit, escolha seus numeros e finalize a compra com o vendedor no WhatsApp.
          </p>
          <button
            type="button"
            onClick={onBackHome}
            className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Ir para o sorteio
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <article
                key={item.raffleId}
                className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{raffle.category}</p>
                    <h3 className="mt-2 text-xl font-semibold text-stone-950">{raffle.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">
                      {item.numbers.length} numeros x {formatCurrency(raffle.price)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3 text-left sm:text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Subtotal</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      {formatCurrency(item.numbers.length * raffle.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.numbers
                    .slice()
                    .sort((a, b) => a - b)
                    .map((number) => (
                      <span
                        key={`${item.raffleId}-${number}`}
                        className="rounded-2xl border border-black/5 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-800"
                      >
                        {formatTicketNumber(number)}
                      </span>
                    ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.4)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Fechamento</p>
              <h3 className="mt-2 text-2xl font-semibold text-stone-950">Pedido pronto para envio</h3>

              <div className="mt-6 space-y-3 rounded-[24px] bg-stone-50 p-4 text-sm text-stone-600">
                <div className="flex items-center justify-between">
                  <span>Itens no carrinho</span>
                  <span className="font-semibold text-stone-950">{cartItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Numeros selecionados</span>
                  <span className="font-semibold text-stone-950">{cartCount}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Total</span>
                <span className="text-3xl font-semibold text-stone-950">{formatCurrency(cartTotal)}</span>
              </div>

              <a
                href={cartCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Finalizar compra no WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
