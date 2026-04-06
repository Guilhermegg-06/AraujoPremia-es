const cloverIcon = (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand-500" fill="currentColor" aria-hidden="true">
    <path d="M12 3.5c1.7 0 3 1.3 3 3 0 1.3-.8 2.4-2 2.8v.2c0 .2 0 .5.1.7 0 .2.1.4.2.5l2.4 2.4c.6.6.6 1.6 0 2.2-.6.6-1.6.6-2.2 0l-2.4-2.4c-.2-.2-.4-.3-.6-.3h-.2c-.2 0-.4 0-.6.1l-2.1 2.1c-.6.6-1.6.6-2.2 0-.6-.6-.6-1.6 0-2.2l2.1-2.1c0-.2.1-.4.1-.6v-.2c-1.2-.4-2-1.5-2-2.8 0-1.7 1.3-3 3-3s3 1.3 3 3c0-.1 0-.2 0-.3 0-1.7 1.3-3 3-3zm0 2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z" />
  </svg>
);

const featuredRifas = [
  {
    emoji: '💻',
    title: 'Notebook Gamer RTX 4060',
    description: 'Prêmio em destaque com números limitados',
    status: 'Em andamento'
  },
  {
    emoji: '📱',
    title: 'iPhone 15 Pro Max 256GB',
    description: 'iPhone novo, na caixa, com nota fiscal e garantia de 1 ano.',
    status: 'Fechado'
  },
  {
    emoji: '📺',
    title: 'Smart TV 65" 4K',
    description: 'Sorteio especial com tela grande e som imersivo.',
    status: 'Concluído'
  }
];

function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex flex-1 items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-brand-50 text-brand-700 shadow-sm">
              {cloverIcon}
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-black/60">araujo premiações</p>
              <h1 className="text-lg font-semibold text-black">Plataforma de Sorteios Online</h1>
            </div>
          </div>
          <div className="rounded-3xl border border-black/10 bg-black/5 px-4 py-3 text-black shadow-sm">
            <span className="text-sm font-medium">🛒 Carrinho</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-12 text-center">
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-brand-600">Sorteios Online</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight text-black">Participe dos melhores sorteios e concorra a prêmios incríveis!</h2>
          <p className="mt-4 mx-auto max-w-2xl text-base text-black/70">Veja os números disponíveis, acompanhe os sorteios que estão acontecendo e escolha com facilidade o que deseja comprar via WhatsApp.</p>

          <div className="mt-8 flex justify-center">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-3xl border border-black/10 bg-black/5 px-5 py-4 shadow-sm">
              <span className="text-black/50">🔎</span>
              <input
                type="text"
                placeholder="Buscar sorteios..."
                className="w-full bg-transparent text-black placeholder:text-black/40 outline-none"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {featuredRifas.map((rifa) => (
            <article key={rifa.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-black">
                    <span>{rifa.emoji}</span> {rifa.title}
                  </h3>
                  <p className="mt-2 text-sm text-black/70">{rifa.description}</p>
                </div>
                <div className="rounded-3xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">{rifa.status}</div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
