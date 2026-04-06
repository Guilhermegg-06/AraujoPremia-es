import { useMemo, useState } from 'react';

type Page = 'home' | 'detail' | 'cart';
type RaffleStatus = 'open' | 'closed';

type Raffle = {
  id: string;
  badge: string;
  title: string;
  category: string;
  description: string;
  price: number;
  totalNumbers: number;
  soldNumbers: number;
  date: string;
  status: RaffleStatus;
  delivery: string;
  highlight: string;
};

type CartItem = {
  raffleId: string;
  numbers: number[];
};

const MAX_SELECTION = 10;
const SELLER_PHONE = '5511999999999';

const cloverIcon = (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-600" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.6 5.2L20 9.8l-4 3.9.9 5.5L12 16.7l-4.9 2.5.9-5.5-4-3.9 5.4-2.6L12 2z" />
  </svg>
);

const backIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const cartIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const raffleData: Raffle[] = [
  {
    id: 'iphone-16-pro',
    badge: 'IP',
    title: 'iPhone 16 Pro Max 256GB',
    category: 'Smartphone premium',
    description:
      'Aparelho novo, lacrado, com nota fiscal e garantia. A campanha agora ficou mais limpa e facil de entender para quem entra pela primeira vez.',
    price: 10,
    totalNumbers: 1000,
    soldNumbers: 348,
    date: '14 de maio de 2026',
    status: 'open',
    delivery: 'Entrega em maos ou envio com seguro.',
    highlight: 'Mais buscado da semana'
  },
  {
    id: 'notebook-rtx-4060',
    badge: 'RTX',
    title: 'Notebook Gamer RTX 4060',
    category: 'Performance e games',
    description:
      'Notebook com RTX 4060, 16GB de RAM e SSD de 512GB. O card agora destaca melhor preco, progresso e disponibilidade sem exagero visual.',
    price: 15,
    totalNumbers: 800,
    soldNumbers: 522,
    date: '19 de maio de 2026',
    status: 'open',
    delivery: 'Entrega com conferencia no recebimento.',
    highlight: 'Ticket medio maior'
  },
  {
    id: 'smart-tv-65',
    badge: 'TV',
    title: 'Smart TV 65 4K',
    category: 'Casa e entretenimento',
    description:
      'Campanha encerrada mantida na vitrine para consulta. A secao separada ajuda a distinguir rapido o que ainda pode ser comprado do que ja fechou.',
    price: 20,
    totalNumbers: 800,
    soldNumbers: 800,
    date: '30 de maio de 2026',
    status: 'closed',
    delivery: 'Campanha encerrada.',
    highlight: 'Encerrado'
  }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('pt-BR').format(value);

const getAvailableNumbers = (raffle: Raffle) => raffle.totalNumbers - raffle.soldNumbers;

const mergeNumbers = (left: number[], right: number[]) =>
  Array.from(new Set([...left, ...right])).sort((a, b) => a - b);

const buildNumberGrid = (raffle: Raffle) => {
  const baseSeed = raffle.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

  const rankedNumbers = Array.from({ length: raffle.totalNumbers }, (_, index) => {
    const number = index + 1;
    const weight = (number * 97 + baseSeed * 13 + (number % 17) * 29) % 10007;

    return { number, weight };
  });

  const soldSet = new Set(
    rankedNumbers
      .slice()
      .sort((left, right) => left.weight - right.weight)
      .slice(0, raffle.soldNumbers)
      .map((item) => item.number)
  );

  return rankedNumbers.map((item) => ({
    number: item.number,
    sold: soldSet.has(item.number)
  }));
};

const buildWhatsAppUrl = (items: CartItem[]) => {
  const lines = items
    .map((item) => {
      const raffle = raffleData.find((entry) => entry.id === item.raffleId);

      if (!raffle) {
        return '';
      }

      const formattedNumbers = item.numbers
        .slice()
        .sort((a, b) => a - b)
        .map((number) => String(number).padStart(4, '0'))
        .join(', ');

      return `- ${raffle.title}: ${formattedNumbers}`;
    })
    .filter(Boolean)
    .join('\n');

  const message = `Ola! Quero concluir a compra destes numeros:\n${lines}\n\nPode confirmar a disponibilidade?`;
  return `https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(message)}`;
};

function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('iphone-16-pro');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const activeRaffle = raffleData.find((raffle) => raffle.id === selectedRaffleId) ?? raffleData[0];
  const activeNumbers = useMemo(() => buildNumberGrid(activeRaffle), [activeRaffle]);
  const openRaffles = raffleData.filter((raffle) => raffle.status === 'open');
  const closedRaffles = raffleData.filter((raffle) => raffle.status === 'closed');

  const cartCount = cartItems.reduce((total, item) => total + item.numbers.length, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const raffle = raffleData.find((entry) => entry.id === item.raffleId);
    return total + (raffle?.price ?? 0) * item.numbers.length;
  }, 0);

  const currentCartNumbers =
    cartItems.find((item) => item.raffleId === activeRaffle.id)?.numbers.slice().sort((a, b) => a - b) ?? [];

  const detailCheckoutUrl =
    selectedNumbers.length > 0 ? buildWhatsAppUrl([{ raffleId: activeRaffle.id, numbers: selectedNumbers }]) : '#';

  const cartCheckoutUrl = cartItems.length > 0 ? buildWhatsAppUrl(cartItems) : '#';

  const totalAvailableOpenNumbers = openRaffles.reduce((total, raffle) => total + getAvailableNumbers(raffle), 0);

  const handleSelectRaffle = (id: string) => {
    setSelectedRaffleId(id);
    setSelectedNumbers([]);
    setPage('detail');
  };

  const toggleNumber = (value: number) => {
    if (activeRaffle.status !== 'open') {
      return;
    }

    setSelectedNumbers((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value].sort((a, b) => a - b).slice(0, MAX_SELECTION);
    });
  };

  const handleAddToCart = () => {
    if (selectedNumbers.length === 0 || activeRaffle.status !== 'open') {
      return;
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.raffleId === activeRaffle.id);

      if (!existingItem) {
        return [...current, { raffleId: activeRaffle.id, numbers: selectedNumbers }];
      }

      return current.map((item) =>
        item.raffleId === activeRaffle.id
          ? { ...item, numbers: mergeNumbers(item.numbers, selectedNumbers) }
          : item
      );
    });

    setSelectedNumbers([]);
    setPage('cart');
  };

  const handleBuyNow = () => {
    if (selectedNumbers.length === 0 || activeRaffle.status !== 'open') {
      return;
    }

    window.open(detailCheckoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-950">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setPage('home');
              setSelectedNumbers([]);
            }}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 shadow-sm">
              {cloverIcon}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-stone-500">Araujo premiacoes</p>
              <h1 className="text-lg font-semibold text-stone-950">Sorteios online</h1>
            </div>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-2 shadow-sm">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Sem cadastro
            </span>
            <button
              type="button"
              onClick={() => setPage('cart')}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {cartIcon}
              Carrinho
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {page === 'home' && (
          <section className="space-y-10">
            <div className="relative overflow-hidden rounded-[36px] border border-black/5 bg-white px-5 py-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_55%)]" />
              <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.12),_transparent_65%)] lg:block" />

              <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                    <span className="rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">Compra guiada por WhatsApp</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5">Escolha de numeros em segundos</span>
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">Painel de sorteios</p>
                    <h2 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
                      Frontend mais limpo, proporcional e facil de usar.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                      Reorganizei a vitrine para o cliente bater o olho, entender o premio, conferir disponibilidade e seguir para a compra sem poluicao visual.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectRaffle(openRaffles[0]?.id ?? raffleData[0].id)}
                      className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                    >
                      Ver sorteio principal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage('cart')}
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
                      <p className="text-sm text-stone-500">Sorteios abertos</p>
                      <p className="mt-1 text-3xl font-semibold text-stone-950">{openRaffles.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-stone-500">Numeros disponiveis</p>
                      <p className="mt-1 text-3xl font-semibold text-stone-950">{formatNumber(totalAvailableOpenNumbers)}</p>
                    </div>
                    <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-sm">
                      <p className="text-sm text-white/80">Canal de fechamento</p>
                      <p className="mt-1 text-lg font-semibold">WhatsApp do vendedor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section id="open-raffles" className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Ao vivo agora</p>
                  <h3 className="text-2xl font-semibold text-stone-950 sm:text-3xl">Sorteios com numeros disponiveis</h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-stone-600">
                  Cards com altura consistente, informacao direta e botoes no tamanho certo para desktop e mobile.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {openRaffles.map((raffle) => {
                  const availableNumbers = getAvailableNumbers(raffle);
                  const progress = (raffle.soldNumbers / raffle.totalNumbers) * 100;

                  return (
                    <article
                      key={raffle.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-38px_rgba(15,23,42,0.42)]"
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-white to-brand-50 px-6 py-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.15),_transparent_45%)]" />
                        <div className="relative flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 shadow-sm">
                              {raffle.category}
                            </span>
                            <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-lg font-semibold text-brand-700 shadow-sm">
                              {raffle.badge}
                            </div>
                          </div>
                          <div className="rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            {formatCurrency(raffle.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-5 p-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-xl font-semibold text-stone-950">{raffle.title}</h4>
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                              {raffle.highlight}
                            </span>
                          </div>
                          <p className="text-sm leading-6 text-stone-600">{raffle.description}</p>
                        </div>

                        <div className="rounded-[24px] bg-stone-50 p-4">
                          <div className="flex items-center justify-between text-sm text-stone-600">
                            <span>Progresso da campanha</span>
                            <span className="font-semibold text-stone-900">
                              {formatNumber(raffle.soldNumbers)} / {formatNumber(raffle.totalNumbers)}
                            </span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full rounded-full bg-stone-950" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-black/5 bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Data</p>
                            <p className="mt-2 text-sm font-semibold text-stone-900">{raffle.date}</p>
                          </div>
                          <div className="rounded-2xl border border-black/5 bg-white p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Disponiveis</p>
                            <p className="mt-2 text-sm font-semibold text-brand-700">{formatNumber(availableNumbers)} numeros</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectRaffle(raffle.id)}
                          className="mt-auto rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                        >
                          Escolher numeros
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Historico visual</p>
                  <h3 className="text-2xl font-semibold text-stone-950 sm:text-3xl">Sorteios encerrados</h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-stone-600">
                  A secao fechada ficou separada para o usuario entender rapido o que ainda esta compravel.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {closedRaffles.map((raffle) => (
                  <article
                    key={raffle.id}
                    className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]"
                  >
                    <div className="grid gap-5 px-6 py-6 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-stone-100 text-2xl font-semibold text-stone-600">
                        {raffle.badge}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                            Encerrado
                          </span>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            {raffle.highlight}
                          </span>
                        </div>
                        <h4 className="mt-3 text-xl font-semibold text-stone-950">{raffle.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-stone-600">{raffle.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectRaffle(raffle.id)}
                        className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}
        {page === 'detail' && (
          <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[30px] border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
                onClick={() => {
                  setPage('home');
                  setSelectedNumbers([]);
                }}
              >
                {backIcon}
                Voltar para os sorteios
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                    activeRaffle.status === 'open' ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {activeRaffle.status === 'open' ? 'Disponivel para compra' : 'Sorteio encerrado'}
                </span>
                <span className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white">
                  {formatCurrency(activeRaffle.price)} por numero
                </span>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
                  <div className="relative overflow-hidden border-b border-black/5 bg-gradient-to-br from-brand-100 via-white to-brand-50 px-6 py-8 sm:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_45%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">{activeRaffle.category}</p>
                        <h2 className="mt-3 text-3xl font-semibold text-stone-950 sm:text-4xl">{activeRaffle.title}</h2>
                        <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">{activeRaffle.description}</p>
                      </div>
                      <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-white text-2xl font-semibold text-brand-700 shadow-sm">
                        {activeRaffle.badge}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-3">
                    <div className="rounded-[24px] bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Data do sorteio</p>
                      <p className="mt-2 text-sm font-semibold text-stone-950">{activeRaffle.date}</p>
                    </div>
                    <div className="rounded-[24px] bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Entrega</p>
                      <p className="mt-2 text-sm font-semibold text-stone-950">{activeRaffle.delivery}</p>
                    </div>
                    <div className="rounded-[24px] bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Numeros livres</p>
                      <p className="mt-2 text-sm font-semibold text-brand-700">
                        {formatNumber(getAvailableNumbers(activeRaffle))} disponiveis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[34px] border border-black/5 bg-white p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Mapa de numeros</p>
                      <h3 className="mt-2 text-2xl font-semibold text-stone-950">Quadrados organizados para selecao rapida</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                        Padronizei o tamanho dos numeros, o espacamento da grade e as cores de estado para ficar facil de ler e clicar.
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
                        {activeNumbers.map((item) => {
                          const isSold = item.sold || activeRaffle.status === 'closed';
                          const isSelected = selectedNumbers.includes(item.number);

                          return (
                            <button
                              key={item.number}
                              type="button"
                              onClick={() => {
                                if (!isSold) {
                                  toggleNumber(item.number);
                                }
                              }}
                              disabled={isSold}
                              className={`h-12 rounded-2xl border text-xs font-semibold transition sm:h-14 sm:text-sm ${
                                isSold
                                  ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                                  : isSelected
                                    ? 'border-stone-950 bg-stone-950 text-white shadow-sm'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                              }`}
                            >
                              {String(item.number).padStart(4, '0')}
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
                      Maximo de {MAX_SELECTION}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3 rounded-[26px] bg-stone-50 p-4 text-sm text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>Numeros escolhidos</span>
                      <span className="font-semibold text-stone-950">{selectedNumbers.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Valor unitario</span>
                      <span className="font-semibold text-stone-950">{formatCurrency(activeRaffle.price)}</span>
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
                          <span
                            key={number}
                            className="rounded-2xl bg-stone-950 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                          >
                            {String(number).padStart(4, '0')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-5">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Total</span>
                    <span className="text-3xl font-semibold text-stone-950">
                      {formatCurrency(activeRaffle.price * selectedNumbers.length)}
                    </span>
                  </div>

                  {activeRaffle.status === 'open' ? (
                    <div className="mt-6 space-y-3">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={selectedNumbers.length === 0}
                        className="w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                      >
                        Adicionar ao carrinho
                      </button>
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={selectedNumbers.length === 0}
                        className="w-full rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
                      >
                        Comprar agora pelo WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                      Este sorteio esta encerrado. Mantive a pagina organizada para consulta, mas a selecao de numeros foi bloqueada.
                    </div>
                  )}
                </div>

                <div className="rounded-[30px] border border-black/5 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Campanha</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm text-stone-600">
                      <span>Vendidos</span>
                      <span className="font-semibold text-stone-950">
                        {formatNumber(activeRaffle.soldNumbers)} / {formatNumber(activeRaffle.totalNumbers)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-stone-950"
                        style={{ width: `${(activeRaffle.soldNumbers / activeRaffle.totalNumbers) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm leading-6 text-stone-600">
                      A lateral agora resume a compra sem ocupar espaco demais nem competir com a grade de numeros.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}
        {page === 'cart' && (
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
                  onClick={() => setPage('home')}
                >
                  {backIcon}
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
                  Mantive essa pagina simples e limpa para nao deixar espacos sobrando nem informacao perdida quando o usuario ainda nao escolheu nada.
                </p>
                <button
                  type="button"
                  onClick={() => setPage('home')}
                  className="mt-6 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Ir para os sorteios
                </button>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const raffle = raffleData.find((entry) => entry.id === item.raffleId);

                    if (!raffle) {
                      return null;
                    }

                    return (
                      <article
                        key={item.raffleId}
                        className="rounded-[30px] border border-black/5 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand-50 text-base font-semibold text-brand-700">
                              {raffle.badge}
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{raffle.category}</p>
                              <h3 className="mt-2 text-xl font-semibold text-stone-950">{raffle.title}</h3>
                              <p className="mt-2 text-sm text-stone-600">
                                {item.numbers.length} numeros x {formatCurrency(raffle.price)}
                              </p>
                            </div>
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
                                {String(number).padStart(4, '0')}
                              </span>
                            ))}
                        </div>
                      </article>
                    );
                  })}
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
        )}
      </main>
    </div>
  );
}

export default App;

